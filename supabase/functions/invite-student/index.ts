import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const resendApiKey = Deno.env.get('RESEND_API_KEY')

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase URL or Service Role Key missing')
    }

    const authHeader = req.headers.get('Authorization')!
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey)
    
    // Verify admin token
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Verify role is ADMIN
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'ADMIN') {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const body = await req.json()
    const { action } = body

    if (action === 'create') {
      const { firstName, lastName, personalEmail, departmentId, year, phone, address } = body

      // 1. RPC call to generate next enrollment number
      const { data: enrollmentNo, error: rpcError } = await supabaseClient.rpc('generate_next_enrollment_no', {
        dept_id: departmentId
      })

      if (rpcError || !enrollmentNo) {
        throw new Error(rpcError?.message || 'Failed to generate enrollment number')
      }

      // 2. Format university email
      const universityEmail = `${enrollmentNo.toLowerCase()}@sms.edu`

      // 3. Generate initial temporary password
      const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).toUpperCase().slice(-4) + '!1'

      // 4. Create User in Auth
      const { data: newAuthUser, error: inviteError } = await supabaseClient.auth.admin.createUser({
        email: universityEmail,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          first_name: firstName,
          last_name: lastName,
          role: 'STUDENT'
        }
      })

      if (inviteError) throw inviteError

      // 5. Insert Student Record
      const { error: studentError } = await supabaseClient
        .from('students')
        .insert({
          id: newAuthUser.user.id,
          first_name: firstName,
          last_name: lastName,
          enrollment_no: enrollmentNo,
          phone: phone,
          address: address,
          department_id: departmentId,
          year: year,
          personal_email: personalEmail,
          university_email: universityEmail,
          credentials_sent: false,
          first_login_completed: false,
          account_status: 'PENDING',
          is_active: true
        })

      if (studentError) {
        await supabaseClient.auth.admin.deleteUser(newAuthUser.user.id)
        throw studentError
      }

      // 6. Log Activity
      await supabaseClient.from('activities').insert({
        user_id: user.id,
        title: 'Student Profile Created',
        description: `Admin created student ${firstName} ${lastName} (${enrollmentNo}). Credentials pending.`,
        type: 'SYSTEM'
      })

      return new Response(JSON.stringify({
        success: true,
        studentId: newAuthUser.user.id,
        enrollmentNo,
        universityEmail
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })

    } else if (action === 'send_credentials') {
      const { studentId } = body

      // Fetch student details
      const { data: student, error: fetchError } = await supabaseClient
        .from('students')
        .select('first_name, last_name, enrollment_no, personal_email, university_email')
        .eq('id', studentId)
        .single()

      if (fetchError || !student) {
        throw new Error('Student profile not found')
      }

      // Generate a fresh temporary password (stateless)
      const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).toUpperCase().slice(-4) + '!1'

      // Update student auth password
      const { error: updateAuthError } = await supabaseClient.auth.admin.updateUserById(
        studentId,
        { password: tempPassword }
      )

      if (updateAuthError) throw updateAuthError

      const loginUrl = `${req.headers.get('origin') || 'http://localhost:5173'}/login`
      const studentName = `${student.first_name} ${student.last_name}`

      // Email template HTML
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #2563eb;">Welcome to SMS Portal, ${studentName}!</h2>
          <p>Your academic account has been created. Use the credentials below to log in:</p>
          <table style="border-collapse: collapse; margin: 20px 0;">
            <tr><td style="padding: 5px 10px; font-weight: bold;">Enrollment Number:</td><td>${student.enrollment_no}</td></tr>
            <tr><td style="padding: 5px 10px; font-weight: bold;">University Email:</td><td>${student.university_email}</td></tr>
            <tr><td style="padding: 5px 10px; font-weight: bold;">Temporary Password:</td><td style="font-family: monospace; background: #f1f5f9; padding: 2px 6px;">${tempPassword}</td></tr>
          </table>
          <p>Please note that you will be required to update this temporary password upon your first login.</p>
          <a href="${loginUrl}" style="display: inline-block; padding: 10px 20px; background: #2563eb; color: #fff; text-decoration: none; border-radius: 6px;">Log In Now</a>
        </div>
      `

      console.log(`Credentials generated for ${student.university_email} [Pass: ${tempPassword}]`)

      // Attempt Resend API Dispatch
      let emailDispatched = false
      if (resendApiKey) {
        try {
          const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${resendApiKey}`
            },
            body: JSON.stringify({
              from: 'SMS Portal <admissions@resend.dev>',
              to: student.personal_email,
              subject: 'Your SMS University Credentials',
              html: emailHtml
            })
          })
          if (res.ok) {
            emailDispatched = true
          } else {
            const resBody = await res.text()
            console.error(`Resend dispatch failed (status ${res.status}):`, resBody)
            throw new Error(`Email provider error (status ${res.status}): ${resBody}`)
          }
        } catch (e) {
          console.error('Resend email dispatch error:', e)
          throw new Error(`Email delivery failed: ${(e as Error).message}`)
        }
      } else {
        throw new Error('Resend API Key (RESEND_API_KEY) is not configured in Supabase Edge Function environment')
      }

      // Update database status (Only runs if emailDispatched is true)
      const now = new Date().toISOString()
      const { error: dbUpdateError } = await supabaseClient
        .from('students')
        .update({
          credentials_sent: true,
          credentials_sent_at: now
        })
        .eq('id', studentId)

      if (dbUpdateError) throw dbUpdateError

      // Log Activity
      await supabaseClient.from('activities').insert({
        user_id: user.id,
        title: 'Credentials Dispatched',
        description: `Dispatched credentials to ${studentName} (${student.enrollment_no})`,
        type: 'SYSTEM'
      })

      return new Response(JSON.stringify({
        success: true,
        tempPassword, // Return so Admin can copy it to clipboard directly
        emailDispatched
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    } else {
      throw new Error('Invalid action')
    }

  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
