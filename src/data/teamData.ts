import { Users, Briefcase, Code, Headphones, Megaphone, Shield, Building, Globe, UserCheck, Settings, DollarSign, FileText, Search, TrendingUp } from 'lucide-react';

export interface TeamMember {
  name: string;
  role: string;
  department: string;
  avatar: string;
  icon: any;
  description: string;
  hasPhoto?: boolean;
  isVacant?: boolean;
  email?: string;
  linkedin?: string;
  github?: string;
}

export interface Department {
  name: string;
  color: string;
  count: number;
  icon: any;
  bgColor: string;
}

export const teamMembers: TeamMember[] = [
  // Executive Leadership
  {
    name: "John K. Gyawu",
    role: "Chief Executive Officer (CEO)",
    department: "Executive Leadership",
    avatar: "JG",
    icon: Briefcase,
    description: "Provides the overarching vision, leads external partnerships, secures strategic alliances, and ensures organizational sustainability.",
    hasPhoto: true,
    email: "john.gyawu@libdsvi.com"
  },
  {
    name: "Boniface K. Weah, Jr.",
    role: "Managing Director (MD)",
    department: "Executive Leadership", 
    avatar: "BW",
    icon: Briefcase,
    description: "Leads day-to-day operations, manages internal coordination, executes strategy, and ensures the effective delivery of services across all divisions.",
    hasPhoto: true,
    email: "director@libdsvi.com",
    linkedin: "#"
  },

  // Technology & Product Department
  {
    name: "Oluwaseun Shobayo",
    role: "IT & Systems Manager",
    department: "Technology & Product",
    avatar: "OS",
    icon: Code,
    description: "Oversees all platforms, websites, and tech systems including performance, hosting, updates, and integrations.",
    email: "oluwaseun.shobayo@libdsvi.com",
    github: "#"
  },
  {
    name: "Vacant",
    role: "Web Development Specialist",
    department: "Technology & Product",
    avatar: "WD",
    icon: Code,
    description: "Builds and maintains all websites and admin panels across divisions.",
    isVacant: true
  },
  {
    name: "Vacant",
    role: "UI/UX Design Specialist",
    department: "Technology & Product",
    avatar: "UX",
    icon: Code,
    description: "Designs user interfaces and ensures optimal user experience and mobile responsiveness.",
    isVacant: true
  },
  {
    name: "Vacant",
    role: "QA & Testing Specialist",
    department: "Technology & Product",
    avatar: "QA",
    icon: Shield,
    description: "Tests and validates site features, performance, and bug resolutions before deployment.",
    isVacant: true
  },

  // Marketing & Communications Department
  {
    name: "Vacant",
    role: "Marketing & Communications Manager",
    department: "Marketing & Communications",
    avatar: "MC",
    icon: Megaphone,
    description: "Manages brand visibility, outreach, digital communication, and promotional campaigns across LDSI.",
    isVacant: true
  },
  {
    name: "Vacant",
    role: "Marketing & Outreach Specialist",
    department: "Marketing & Communications",
    avatar: "MO",
    icon: TrendingUp,
    description: "Develops and executes outreach efforts to institutions, communities, and stakeholders.",
    isVacant: true
  },
  {
    name: "Vacant",
    role: "Content & Communications Specialist",
    department: "Marketing & Communications",
    avatar: "CC",
    icon: FileText,
    description: "Crafts content strategies, writes messaging for web and campaigns, manages tone and internal/external communication.",
    isVacant: true
  },
  {
    name: "Vacant",
    role: "Social Media Specialist",
    department: "Marketing & Communications",
    avatar: "SM",
    icon: Megaphone,
    description: "Manages social platforms, publishes content, and drives audience engagement.",
    isVacant: true
  },

  // Client Services Department
  {
    name: "Vacant",
    role: "Client Success Manager",
    department: "Client Services",
    avatar: "CS",
    icon: UserCheck,
    description: "Ensures client satisfaction from onboarding through support, with timely assistance and updates.",
    isVacant: true
  },
  {
    name: "Vacant",
    role: "Client Onboarding Specialist",
    department: "Client Services",
    avatar: "CO",
    icon: Users,
    description: "Assists institutions through the onboarding and briefing process.",
    isVacant: true
  },
  {
    name: "Vacant",
    role: "Client Support Specialist",
    department: "Client Services",
    avatar: "CSS",
    icon: Headphones,
    description: "Handles technical queries, client updates, and ongoing customer support.",
    isVacant: true
  },

  // Operations & Finance Department
  {
    name: "Vacant",
    role: "Operations & Finance Manager",
    department: "Operations & Finance",
    avatar: "OF",
    icon: DollarSign,
    description: "Manages finances, human resource needs, logistics, internal processes, and compliance.",
    isVacant: true
  },
  {
    name: "Vacant",
    role: "Accounts & Billing Specialist",
    department: "Operations & Finance",
    avatar: "AB",
    icon: DollarSign,
    description: "Manages payment processing, invoicing, subscriptions, and financial reporting.",
    isVacant: true
  },
  {
    name: "Vacant",
    role: "Administrative Support Specialist",
    department: "Operations & Finance",
    avatar: "AS",
    icon: Settings,
    description: "Provides general office support, coordination, and logistics assistance.",
    isVacant: true
  },

  // DSVI Division
  {
    name: "Vacant",
    role: "DSVI Supervisor",
    department: "DSVI",
    avatar: "DS",
    icon: Building,
    description: "Oversees website services and support for schools, ensuring accurate reflection of school identity, academic integrity, and educational messaging.",
    isVacant: true
  },
  {
    name: "Vacant",
    role: "Educational Liaison Specialist",
    department: "DSVI",
    avatar: "EL",
    icon: Users,
    description: "Collaborates with school reps to align academic content with website structure and user needs.",
    isVacant: true
  },
  {
    name: "Vacant",
    role: "DSVI QA Specialist",
    department: "DSVI",
    avatar: "DQ",
    icon: Shield,
    description: "Conducts quality reviews on all school sites to ensure they meet agreed functionality and design expectations.",
    isVacant: true
  },

  // DSVI School Directory Division
  {
    name: "Vacant",
    role: "Directory Supervisor",
    department: "DSVI School Directory",
    avatar: "DiS",
    icon: Search,
    description: "Manages the central school listing platform, ensuring listings are authentic and promotions are executed smoothly.",
    isVacant: true
  },
  {
    name: "Vacant",
    role: "Directory Admin Specialist",
    department: "DSVI School Directory",
    avatar: "DA",
    icon: Settings,
    description: "Manages school profiles, categories, metadata, and backend updates on the directory.",
    isVacant: true
  },
  {
    name: "Vacant",
    role: "School Verification Specialist",
    department: "DSVI School Directory",
    avatar: "SV",
    icon: UserCheck,
    description: "Validates the legitimacy and accreditation of listed schools.",
    isVacant: true
  },
  {
    name: "Vacant",
    role: "Promotions & Boost Specialist",
    department: "DSVI School Directory",
    avatar: "PB",
    icon: TrendingUp,
    description: "Manages in-directory promotional campaigns and boosts for subscribed institutions.",
    isVacant: true
  },

  // Digital Visibility Initiative (DVI) Division
  {
    name: "Vacant",
    role: "DVI Supervisor",
    department: "DVI",
    avatar: "DVS",
    icon: Globe,
    description: "Oversees all website services and directory listings for non-school institutions (businesses, NGOs, churches, etc.).",
    isVacant: true
  },
  {
    name: "Vacant",
    role: "Client Intake & Strategy Specialist",
    department: "DVI",
    avatar: "CIS",
    icon: Users,
    description: "Conducts strategic intake sessions to define client goals and digital visibility roadmap.",
    isVacant: true
  },
  {
    name: "Vacant",
    role: "DVI Directory Listings Specialist",
    department: "DVI",
    avatar: "DDL",
    icon: Search,
    description: "Manages profiles in the DVI Business Directory and ensures accurate listings.",
    isVacant: true
  }
];

export const departments: Department[] = [
  { 
    name: "Executive Leadership", 
    color: "bg-blue-100 text-blue-800", 
    bgColor: "bg-blue-600",
    icon: Briefcase,
    count: teamMembers.filter(member => member.department === "Executive Leadership").length 
  },
  { 
    name: "Technology & Product", 
    color: "bg-purple-100 text-purple-800", 
    bgColor: "bg-purple-600",
    icon: Code,
    count: teamMembers.filter(member => member.department === "Technology & Product").length 
  },
  { 
    name: "Marketing & Communications", 
    color: "bg-pink-100 text-pink-800", 
    bgColor: "bg-pink-600",
    icon: Megaphone,
    count: teamMembers.filter(member => member.department === "Marketing & Communications").length 
  },
  { 
    name: "Client Services", 
    color: "bg-green-100 text-green-800", 
    bgColor: "bg-green-600",
    icon: UserCheck,
    count: teamMembers.filter(member => member.department === "Client Services").length 
  },
  { 
    name: "Operations & Finance", 
    color: "bg-yellow-100 text-yellow-800", 
    bgColor: "bg-yellow-600",
    icon: DollarSign,
    count: teamMembers.filter(member => member.department === "Operations & Finance").length 
  },
  { 
    name: "DSVI", 
    color: "bg-indigo-100 text-indigo-800", 
    bgColor: "bg-indigo-600",
    icon: Building,
    count: teamMembers.filter(member => member.department === "DSVI").length 
  },
  { 
    name: "DSVI School Directory", 
    color: "bg-cyan-100 text-cyan-800", 
    bgColor: "bg-cyan-600",
    icon: Search,
    count: teamMembers.filter(member => member.department === "DSVI School Directory").length 
  },
  { 
    name: "DVI", 
    color: "bg-teal-100 text-teal-800", 
    bgColor: "bg-teal-600",
    icon: Globe,
    count: teamMembers.filter(member => member.department === "DVI").length 
  }
];

export const getDepartmentIcon = (dept: string) => {
  const department = departments.find(d => d.name === dept);
  return department ? department.icon : Users;
};

export const getDepartmentColor = (dept: string) => {
  const department = departments.find(d => d.name === dept);
  return department ? department.bgColor : "bg-gray-600";
};