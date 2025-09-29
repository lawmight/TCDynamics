# 📚 What to Learn TODAY - Priority Order
## Your Focused Learning Path (Based on Cursor + Supabase + Vercel)

> **Goal**: Start building your MVP by end of today
> **Time**: 6-8 hours of focused learning + doing
> **Philosophy**: Learn by building, not by consuming

---

## 🎯 **TODAY'S PRIORITY** (In Order)

### **Priority 1: Supabase Basics** ⭐⭐⭐ CRITICAL
**Time**: 2 hours
**Why First**: This is your entire backend - database, auth, storage, everything!

#### **What to Learn**:
```
1. Create Supabase project (5 min)
2. Understand PostgreSQL basics (20 min)
3. Set up authentication (30 min)
4. Database queries (30 min)
5. File storage (20 min)
6. Row Level Security basics (15 min)
```

#### **HOW to Learn** (Learning by DOING):

**Step 1** (10 minutes): Watch & Do
```
Watch: "Supabase in 100 Seconds" by Fireship
URL: https://www.youtube.com/watch?v=zBZgdTb-dns

Then immediately:
1. Go to supabase.com
2. Create account
3. Create new project "tcdynamics"
4. Get your API keys
```

**Step 2** (30 minutes): Build Your First Table
```javascript
// In Supabase SQL Editor, paste this:

-- Create users profile table
create table public.profiles (
  id uuid references auth.users primary key,
  email text unique,
  full_name text,
  company text,
  created_at timestamp default now()
);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- Policy: Users can read own profile
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

-- Policy: Users can update own profile  
create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

-- Test it!
```

**Step 3** (30 minutes): Set Up Authentication
```typescript
// Create /src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

// Test authentication
const testAuth = async () => {
  // Sign up
  const { data, error } = await supabase.auth.signUp({
    email: 'test@example.com',
    password: 'password123'
  })
  console.log('Signup:', data, error)
  
  // Sign in
  const { data: signInData } = await supabase.auth.signInWithPassword({
    email: 'test@example.com',
    password: 'password123'
  })
  console.log('Sign in:', signInData)
  
  // Get user
  const { data: { user } } = await supabase.auth.getUser()
  console.log('Current user:', user)
}
```

**Step 4** (30 minutes): File Upload Practice
```typescript
// Create /src/lib/storage.ts
import { supabase } from './supabase'

export const uploadDocument = async (file: File, userId: string) => {
  const fileName = `${userId}/${Date.now()}_${file.name}`
  
  const { data, error } = await supabase.storage
    .from('documents')
    .upload(fileName, file)
    
  if (error) {
    console.error('Upload error:', error)
    return null
  }
  
  // Get public URL
  const { data: urlData } = supabase.storage
    .from('documents')
    .getPublicUrl(fileName)
    
  return urlData.publicUrl
}
```

**By End of Priority 1**: You can authenticate users, save data, upload files ✅

---

### **Priority 2: React + TypeScript Refresher** ⭐⭐⭐ CRITICAL
**Time**: 1 hour
**Why**: Your frontend foundation

#### **What to Focus On**:
```
1. React Hooks (useState, useEffect) - 15 min
2. TypeScript basics - 15 min
3. Async/await - 15 min
4. React Router basics - 15 min
```

#### **HOW to Learn** (With Cursor!):

**Use Cursor to Learn** (30 minutes):
```
Open Cursor and ask:

"Explain React hooks with examples. Show me:
1. useState for form inputs
2. useEffect for data fetching
3. How to use async/await with Supabase
4. How to handle loading states"

Cursor will teach you with actual code examples!
```

**Build a Simple Component** (30 minutes):
```typescript
// Ask Cursor to help you build this:
"Build me a LoginForm component with:
- Email and password inputs
- Loading state while submitting
- Error handling
- TypeScript types
- Uses Supabase auth"

// Cursor will generate it, then you:
1. Read the code Cursor wrote
2. Understand each part
3. Modify it slightly
4. Test it
```

**By End of Priority 2**: You can build React components with TypeScript ✅

---

### **Priority 3: Vercel Deployment** ⭐⭐ IMPORTANT
**Time**: 30 minutes
**Why**: See your work live immediately!

#### **What to Learn**:
```
1. Deploy React app to Vercel (10 min)
2. Environment variables (10 min)
3. Custom domain setup (10 min)
```

#### **HOW to Learn** (HANDS-ON):

**Step 1** (10 minutes): First Deployment
```bash
# Install Vercel CLI
npm install -g vercel

# Initialize project
npm create vite@latest tcdynamics -- --template react-ts
cd tcdynamics
npm install

# Deploy!
vercel login
vercel

# ✅ Your site is live in 2 minutes!
```

**Step 2** (10 minutes): Add Environment Variables
```bash
# In Vercel dashboard:
Settings → Environment Variables

Add:
VITE_SUPABASE_URL = https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY = eyJxxx...

# Redeploy
vercel --prod
```

**Step 3** (10 minutes): Add Custom Domain
```bash
# In Vercel dashboard:
Settings → Domains → Add Domain
Enter: tcdynamics.fr

# Copy DNS records to your domain registrar
# Wait 5-10 minutes

# ✅ Live at https://tcdynamics.fr
```

**By End of Priority 3**: Your app is deployed and live! ✅

---

### **Priority 4: TailwindCSS Basics** ⭐⭐ IMPORTANT
**Time**: 1 hour  
**Why**: Make things look good fast

#### **What to Focus On**:
```
1. Basic utility classes (30 min)
2. Responsive design (15 min)
3. shadcn/ui components (15 min)
```

#### **HOW to Learn** (Let Cursor Help):

**Ask Cursor to Build Examples** (30 minutes):
```
"Build me these components with TailwindCSS:

1. A hero section with:
   - Large heading
   - Subtitle
   - Two buttons (primary and outline)
   - Responsive design

2. A card component with:
   - Image
   - Title
   - Description
   - Button
   - Hover effects

3. A form with:
   - Email input
   - Password input
   - Submit button
   - Error states"
```

**Install shadcn/ui** (15 minutes):
```bash
npx shadcn-ui@latest init

# Add components
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
npx shadcn-ui@latest add form

# Use them in your app (Cursor will show you how!)
```

**Practice with Real UI** (15 minutes):
```
Ask Cursor:
"Using shadcn/ui components and TailwindCSS, build me:
- A navigation bar
- A feature card grid
- A pricing card

Make it responsive and beautiful."

Then customize what Cursor generates.
```

**By End of Priority 4**: You can build good-looking UIs fast ✅

---

### **Priority 5: Stripe Basics** ⭐ USEFUL TODAY
**Time**: 30 minutes
**Why**: Understand how you'll get paid

#### **What to Learn**:
```
1. Stripe Checkout basics (15 min)
2. How subscriptions work (10 min)
3. Webhooks concept (5 min)
```

#### **HOW to Learn**:

**Read & Experiment** (15 minutes):
```
1. Create Stripe account (test mode)
2. Go to: stripe.com/docs/payments/checkout

3. Copy their quickstart example
4. Understand the flow:
   - User clicks "Subscribe"
   - Redirect to Stripe Checkout page
   - Stripe handles payment
   - Redirect back to your site
   - Webhook confirms payment
```

**Watch Quick Tutorial** (15 minutes):
```
Search YouTube: "Stripe Checkout Tutorial React"
Watch one 10-15 min video

Key concepts to understand:
- Payment Intents
- Subscriptions
- Webhook events
- Test mode vs Production
```

**By End of Priority 5**: You understand Stripe flow ✅

---

### **Priority 6: Build Something Small** ⭐⭐⭐ MOST IMPORTANT
**Time**: 2-3 hours
**Why**: Cement everything by BUILDING

#### **Build This TODAY**:

```
Mini Project: "Document Upload App"

Features:
1. User can sign up
2. User can log in
3. User can upload a file
4. User sees list of their files
5. User can download files

Technologies:
- Supabase (auth + storage + database)
- React + TypeScript
- TailwindCSS + shadcn/ui
- Deployed on Vercel
```

#### **HOW to Build** (With Cursor as Your Pair Programmer):

**Phase 1** (30 minutes): Authentication
```
Ask Cursor:
"Build me a complete authentication system with:
1. SignUp page with email/password
2. Login page
3. Protected routes (only logged-in users)
4. Logout button
5. Using Supabase Auth
6. TypeScript types
7. Loading and error states"

Then:
- Read the generated code
- Test it
- Understand each part
- Customize the UI
```

**Phase 2** (45 minutes): File Upload
```
Ask Cursor:
"Add file upload functionality:
1. Upload component with drag-and-drop
2. File validation (PDF, images only)
3. Upload to Supabase Storage
4. Save metadata to database
5. Show upload progress
6. Handle errors"

Then:
- Test uploading files
- Check Supabase dashboard
- See files in storage
- See records in database
```

**Phase 3** (45 minutes): File List & Download
```
Ask Cursor:
"Build a file list component that:
1. Fetches user's files from Supabase
2. Shows file name, size, upload date
3. Download button for each file
4. Delete button
5. Nice UI with shadcn/ui Card
6. Loading skeleton"

Then:
- Test the full flow
- Debug any issues
- Polish the UI
```

**Phase 4** (30 minutes): Deploy
```bash
# Commit to GitHub
git add .
git commit -m "Document upload app MVP"
git push

# Deploy to Vercel
vercel --prod

# Add environment variables in Vercel
# Test live site

# ✅ You built and deployed a full app in one day!
```

**By End of Priority 6**: You have a WORKING, DEPLOYED app! 🎉

---

## 📚 **LEARNING RESOURCES** (Use These Today)

### **Supabase** (Priority 1)
```
□ Supabase Docs: https://supabase.com/docs
□ "Supabase in 100 Seconds" (YouTube - Fireship)
□ "Supabase Crash Course" (YouTube - any recent one)
□ Official examples: https://github.com/supabase/supabase/tree/master/examples
```

### **React + TypeScript** (Priority 2)
```
□ React Docs: https://react.dev
□ TypeScript Handbook: https://www.typescriptlang.org/docs/handbook/
□ Or just ask Cursor: "Explain React hooks with TypeScript examples"
```

### **Vercel** (Priority 3)
```
□ Vercel Docs: https://vercel.com/docs
□ Just follow their UI, it's super simple
□ Or ask Cursor: "How do I deploy to Vercel?"
```

### **TailwindCSS** (Priority 4)
```
□ Tailwind Docs: https://tailwindcss.com/docs
□ shadcn/ui: https://ui.shadcn.com
□ Or ask Cursor: "Build me a component with Tailwind"
```

### **Stripe** (Priority 5)
```
□ Stripe Docs: https://stripe.com/docs
□ "Stripe Checkout Tutorial" (YouTube)
□ Test with Stripe test cards
```

---

## ⏰ **YOUR ACTUAL SCHEDULE TODAY**

### **Morning Session** (4 hours)

**9:00 - 10:00**: ☕ Setup & Supabase Basics
```
□ Create Supabase account
□ Create first project
□ Watch "Supabase in 100 Seconds"
□ Create first table
□ Test auth functions
```

**10:00 - 11:00**: 💻 React + TypeScript with Cursor
```
□ Create new React project
□ Install dependencies
□ Ask Cursor to teach you hooks
□ Build a simple form component
□ Connect to Supabase
```

**11:00 - 11:30**: 🚀 Deploy to Vercel
```
□ Install Vercel CLI
□ Deploy your project
□ Add environment variables
□ See it live!
```

**11:30 - 12:00**: 🎨 TailwindCSS Practice
```
□ Install TailwindCSS
□ Install shadcn/ui
□ Ask Cursor to build example components
□ Make things look pretty
```

---

### **Afternoon Session** (3 hours)

**13:00 - 13:30**: 💳 Stripe Basics
```
□ Create Stripe account
□ Read Checkout docs
□ Watch quick tutorial
□ Understand the flow
```

**13:30 - 16:00**: 🏗️ BUILD YOUR MINI PROJECT
```
□ Authentication pages (signup/login)
□ File upload component
□ File list component
□ Deploy to Vercel
□ Test everything
```

**16:00 - 16:30**: 📝 Review & Document
```
□ What worked?
□ What confused you?
□ What to learn tomorrow?
□ Commit all code
```

---

## 🎯 **LEARNING PRINCIPLES** (Follow These!)

### **1. Learn by BUILDING, not watching**
```
❌ Watch 5 hours of tutorials
✅ Watch 30 min tutorial, build for 4.5 hours
```

### **2. Use Cursor as Your Teacher**
```
Instead of Googling or watching videos:

Ask Cursor:
"Explain X concept and show me working code"
"Build me Y component and explain how it works"
"Why did you use Z pattern here?"

Cursor gives you personalized, context-aware teaching!
```

### **3. Build the SMALLEST Thing That Works**
```
❌ "I need to learn everything about Supabase"
✅ "I need to sign up a user - just that"

Then add features one by one.
```

### **4. Deploy Early and Often**
```
Deploy after every feature:
- Built login? Deploy it!
- Added upload? Deploy it!
- Fixed bug? Deploy it!

Seeing it live = motivation boost
```

### **5. Don't Get Stuck**
```
If stuck for >15 minutes:

1. Ask Cursor for help
2. Check official docs
3. Ask specific question on Discord/Reddit
4. Move to next feature, come back later

Don't waste hours being stuck!
```

---

## 🚫 **WHAT NOT TO LEARN TODAY**

### **SKIP These** (Not needed yet):
```
❌ Advanced TypeScript (generics, decorators)
❌ React performance optimization
❌ Docker/Kubernetes
❌ GraphQL
❌ Web3/Blockchain
❌ Advanced Supabase features (Edge Functions, etc.)
❌ Testing (add later)
❌ CI/CD pipelines (Vercel does this)
❌ SEO optimization (too early)
❌ Azure AI services (add Month 5+)
```

**Focus on building MVP basics first!**

---

## ✅ **SUCCESS CRITERIA FOR TODAY**

By end of today, you should have:

### **Knowledge** ✅
```
□ Understand Supabase auth
□ Can create database tables
□ Can upload files to Supabase Storage
□ Can build React components
□ Can deploy to Vercel
□ Understand Stripe basics
```

### **Skills** ✅
```
□ Can sign up/login a user
□ Can save data to database
□ Can upload files
□ Can build UI with TailwindCSS
□ Can deploy changes
```

### **Built** ✅
```
□ Working mini app (document upload)
□ Deployed to Vercel
□ Connected to Supabase
□ Live URL you can share
```

### **Confidence** ✅
```
□ "I can build this!"
□ "I understand the stack"
□ "I can ship features fast with Cursor"
□ "I'm ready to build my MVP tomorrow"
```

---

## 📅 **WHAT TO LEARN TOMORROW**

Once you finish today's priorities:

### **Day 2** (Tomorrow):
```
1. Supabase Row Level Security (deep dive)
2. React Router (multi-page app)
3. Form handling & validation
4. Error boundaries
5. Loading states & skeletons
```

### **Day 3**:
```
1. Stripe Checkout integration (full)
2. Webhook handling
3. Subscription management
4. Email notifications with Resend
```

### **Day 4-7**:
```
1. Build landing page
2. Build dashboard
3. Build settings page
4. Polish UI/UX
5. Deploy MVP
```

---

## 🎯 **YOUR IMMEDIATE NEXT STEPS**

### **Right Now** (Next 30 minutes):

**Step 1** (5 min):
```bash
# Open terminal
cd ~/projects
mkdir tcdynamics-learn
cd tcdynamics-learn
```

**Step 2** (10 min):
```bash
# Create Supabase account
Open: https://supabase.com
Click: "Start your project"
Create account
Create new project: "tcdynamics-test"
Copy your API keys
```

**Step 3** (15 min):
```bash
# Create React project
npm create vite@latest . -- --template react-ts
npm install
npm install @supabase/supabase-js

# Create .env.local
echo "VITE_SUPABASE_URL=your_url" > .env.local
echo "VITE_SUPABASE_ANON_KEY=your_key" >> .env.local

# Start dev server
npm run dev
```

**✅ You're now ready to follow the learning plan!**

---

## 💡 **TIPS FOR TODAY**

### **Stay Focused**
```
✅ Close Twitter/LinkedIn
✅ Put phone in another room
✅ Use Pomodoro: 45 min work, 15 min break
✅ One priority at a time
```

### **Use Cursor Effectively**
```
Good prompts:
✅ "Build me X component with Y features using Z library"
✅ "Explain why you used this pattern"
✅ "Add error handling to this function"

Bad prompts:
❌ "Build my entire app"
❌ "Make it better" (too vague)
❌ "Fix this" (give context!)
```

### **Document as You Learn**
```
Create notes.md and write:
- What you learned
- Code snippets that work
- Problems you solved
- Questions for tomorrow

This becomes your personal docs!
```

### **Celebrate Small Wins**
```
✅ Created Supabase project? Awesome!
✅ Deployed to Vercel? Amazing!
✅ User can log in? You're crushing it!

Small wins = motivation = momentum
```

---

## 🏆 **FINAL MOTIVATION**

**Remember**:
- You don't need to know everything
- You just need to know enough to START
- Cursor will help you along the way
- Learning by building is 10x faster than tutorials
- Every expert was once a beginner

**By end of today**:
- You'll have working knowledge of your stack
- You'll have deployed a real app
- You'll be ready to build your MVP tomorrow
- You'll have more confidence than 99% of "aspiring founders"

---

## 📋 **QUICK CHECKLIST FOR TODAY**

Print this and check off as you go:

```
Morning:
□ Create Supabase account
□ Create first table
□ Test auth functions
□ Create React project
□ Connect to Supabase
□ Deploy to Vercel

Afternoon:
□ Install TailwindCSS + shadcn/ui
□ Create Stripe account
□ Build mini app: auth
□ Build mini app: upload
□ Build mini app: list files
□ Deploy final version

Evening:
□ Review what you learned
□ Document key learnings
□ Plan tomorrow
□ Celebrate! 🎉
```

---

**START NOW!** ⏰

**First action**: Create Supabase account (5 minutes)

**Go!** 🚀

---

**Document Version**: 1.0
**Last Updated**: September 29, 2025
**Time Required**: 6-8 hours
**Outcome**: Working app deployed + confidence to build MVP