import type { LucideIcon } from 'lucide-react';
import {
  Bot, Mic, Flame, Trophy, Code2, LineChart, Map, Users2,
  Lightbulb, FileSearch, FileText, UserCircle2,
  LayoutDashboard, Settings,
} from 'lucide-react';

export const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'Roadmap', href: '#roadmap' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
];

export interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const features: Feature[] = [
  { icon: Bot, title: 'AI Coding Assistant', description: 'Get real-time, context-aware help as you write — from syntax fixes to full approach reviews.' },
  { icon: Mic, title: 'AI Interview Practice', description: 'Rehearse technical interviews with a conversational AI interviewer that adapts to your answers.' },
  { icon: Flame, title: 'Daily Challenges', description: 'One curated problem a day, tuned to your skill level, to keep your streak — and skills — alive.' },
  { icon: Trophy, title: 'Leaderboard', description: 'See how you rank against the community and your friends across weekly contests.' },
  { icon: Code2, title: 'Coding Playground', description: 'A full in-browser editor with instant execution, test cases, and multi-language support.' },
  { icon: LineChart, title: 'Progress Analytics', description: 'Visualize your growth across topics, difficulty, and time with detailed breakdowns.' },
  { icon: Map, title: 'AI Learning Roadmap', description: 'A personalized path from your current level to your target role, updated as you improve.' },
  { icon: Users2, title: 'Mock Interviews', description: 'Pair up with peers or AI for realistic, timed mock interviews with structured feedback.' },
  { icon: Lightbulb, title: 'Smart Hints', description: 'Nudges, not answers — hints that guide your thinking without giving the solution away.' },
  { icon: FileSearch, title: 'Code Review', description: 'Submit any solution for an instant AI review covering correctness, style, and complexity.' },
  { icon: FileText, title: 'Resume Builder', description: 'Turn your solved problems and projects into a resume tailored to the roles you want.' },
  { icon: UserCircle2, title: 'Profile', description: 'A living record of your skills, badges, and activity — shareable with recruiters.' },
];

export const roadmapStages = [
  { level: 'Beginner', title: 'Foundations', description: 'Syntax, data types, control flow, and your first 50 solved problems.', topics: ['Variables & Types', 'Loops & Conditionals', 'Arrays & Strings', 'Basic Recursion'] },
  { level: 'Intermediate', title: 'Core Data Structures', description: 'Trees, graphs, and the patterns behind most interview questions.', topics: ['Hash Maps', 'Trees & Graphs', 'Sorting & Searching', 'Two Pointers'] },
  { level: 'Advanced', title: 'Algorithmic Depth', description: 'Dynamic programming, greedy strategies, and system design basics.', topics: ['Dynamic Programming', 'Greedy Algorithms', 'Backtracking', 'System Design 101'] },
  { level: 'Expert', title: 'Interview Ready', description: 'Full mock interviews, optimization drills, and behavioral prep.', topics: ['Mock Interviews', 'Complexity Optimization', 'Behavioral Prep', 'Negotiation Basics'] },
];

export const testimonials = [
  { name: 'Ananya Sharma', role: 'SDE @ fintech startup', avatar: 'AS', rating: 5, quote: 'The AI interviewer caught gaps in my explanations that no LeetCode grind ever surfaced. I walked into my real interview calm.' },
  { name: 'Marcus Webb', role: 'CS Senior, Georgia Tech', avatar: 'MW', rating: 5, quote: 'Daily challenges kept me consistent for the first time. The streak system is annoyingly effective — in a good way.' },
  { name: 'Priya Menon', role: 'New grad, backend eng', avatar: 'PM', rating: 4, quote: 'Code review feedback reads like a senior engineer left comments, not a linter. That distinction matters a lot.' },
  { name: 'Daniel Osei', role: 'Bootcamp grad', avatar: 'DO', rating: 5, quote: 'The roadmap told me exactly what to study next instead of me guessing. Went from stuck to job-ready in ten weeks.' },
  { name: 'Lin Chen', role: 'Master\u2019s student', avatar: 'LC', rating: 5, quote: 'Mock interviews with instant scoring made the real thing feel like round two, not round one.' },
];

export const pricingPlans = [
  {
    name: 'Free',
    price: 0,
    description: 'Start building your fundamentals.',
    features: ['50 problems / month', 'Community leaderboard', 'Basic AI hints', 'Public profile'],
    cta: 'Get Started',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: 19,
    description: 'For serious interview prep.',
    features: ['Unlimited problems', 'Full AI interview practice', 'Detailed analytics', 'Resume builder', 'Priority code review'],
    cta: 'Start Free Trial',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: null,
    description: 'For bootcamps & universities.',
    features: ['Everything in Pro', 'Cohort management', 'Custom problem sets', 'Dedicated support', 'SSO & admin controls'],
    cta: 'Contact Sales',
    highlighted: false,
  },
];

export const faqs = [
  { q: 'How does the AI interview practice actually work?', a: 'You join a live session with an AI interviewer that asks a real coding or behavioral question, listens to your reasoning, and asks natural follow-ups \u2014 then scores your communication and technical accuracy.' },
  { q: 'Can I cancel my Pro subscription anytime?', a: 'Yes. Cancel from your account settings whenever you like \u2014 you\u2019ll keep Pro access until the end of your current billing period, no questions asked.' },
  { q: 'Which programming languages are supported?', a: 'The playground and interview sessions support JavaScript, TypeScript, Python, Java, C++, and Go, with more languages added regularly.' },
  { q: 'Is there a free plan?', a: 'Yes \u2014 the Free plan includes 50 problems a month, community leaderboard access, and basic AI hints, no credit card required.' },
  { q: 'Do you offer discounts for students?', a: 'Students with a valid .edu email get 40% off Pro. Apply the discount from the billing tab after signing up.' },
];

export const sidebarLinks: { to: string; label: string; icon: LucideIcon }[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/problems', label: 'Problems', icon: Code2 },
  { to: '/interview', label: 'AI Interview', icon: Mic },
  { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { to: '/profile', label: 'Profile', icon: UserCircle2 },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export const trustedLogos = ['Nimbus', 'Vertex Labs', 'Quantify', 'Northwind', 'Pixel Forge', 'Latitude', 'Ionic', 'Everline'];
