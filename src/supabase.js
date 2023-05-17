import { createClient } from '@supabase/supabase-js'

const options = {
    schema: 'public',
    headers: { 'x-my-custom-header': 'sdc' },
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
}
export const supabase = createClient("https://eobtxqizqevgmqrqmvjh.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvYnR4cWl6cWV2Z21xcnFtdmpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODQyMjQyMzQsImV4cCI6MTk5OTgwMDIzNH0.HFi7T6FC52V11WSSl3KcXIFl77WWkcmjtVeTOKHyyZY", options)