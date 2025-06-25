import { Users, Briefcase, Code, Headphones, Megaphone, Shield } from 'lucide-react';

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
  // Leadership
  {
    name: "John Gyawu",
    role: "Establishment Executive",
    department: "Leadership",
    avatar: "JG",
    icon: Briefcase,
    description: "Originator and steward of DSVI's long-term mission, driving strategic direction, public trust, and institutional impact.",
    hasPhoto: true,
    email: "john.gyawu@libdsvi.com"
  },
  {
    name: "B. K. Weah, Jr.",
    role: "Director",
    department: "Leadership", 
    avatar: "BW",
    icon: Briefcase,
    description: "B. K. Weah, Jr. is a Liberian entrepreneur and leader who combines clear vision with practical leadership. He works at the intersection of technology, education, and social progress. For nearly 20 years, he has contributed to education, business, and social development in Liberia. He leads the Digital School Visibility Initiative (DSVI), uniting different teams and ensuring their daily work supports a larger goal. Beyond managing operations, he focuses on building strong teams and fostering organizational growth. His aim is to make a lasting, positive impact on Liberia's schools.",
    hasPhoto: true,
    email: "director@libdsvi.com",
    linkedin: "#"
  },  // Operations
  {
    name: "Archie Wento",
    role: "Operations Manager",
    department: "Operations",
    avatar: "AW",
    icon: Users,
    description: "Coordinates workflow, logistics, and project delivery across teams to ensure smooth execution of services.",
    email: "operations@libdsvi.com"
  },
  {
    name: "Vacant",
    role: "Finance Manager",
    department: "Operations",
    avatar: "FM",
    icon: Shield,
    description: "Manages financial planning, budgeting, and compliance to keep DSVI fiscally sound and accountable.",
    isVacant: true
  },
  // IT Team
  {
    name: "Om Jaiswal",
    role: "Lead Developer",
    department: "IT",
    avatar: "OJ",
    icon: Code,
    description: "Full-stack developer specializing in modern web technologies and educational platform development. Leads technical architecture and development processes.",
    email: "om.jaiswal@libdsvi.com",
    github: "#"
  },
  {
    name: "Oluwaseun Shobayo",
    role: "Lead Developer",
    department: "IT",
    avatar: "OS",
    icon: Code,
    description: "Experienced developer focused on scalable web solutions and user experience optimization. Specializes in frontend technologies and system integration.",
    email: "oluwaseun.shobayo@libdsvi.com",
    github: "#"
  },
  {
    name: "Vacant",
    role: "UI/UX Specialist",
    department: "IT",
    avatar: "UX",
    icon: Code,
    description: "Designs intuitive, accessible, and engaging user interfaces for school websites and internal platforms.",
    isVacant: true
  },
  {
    name: "Vacant",
    role: "Quality Assurance Specialist",
    department: "IT",
    avatar: "QA",
    icon: Shield,
    description: "Ensures every deliverable meets internal standards and is error-free across functionality, presentation, and content.",
    isVacant: true
  },  {
    name: "Vacant",
    role: "Content & Data Coordinator",
    department: "IT",
    avatar: "CD",
    icon: Users,
    description: "Responsible for uploading, organizing, and managing school-provided content across their respective websites.",
    isVacant: true
  },
  // Support
  {
    name: "Vacant",
    role: "Training Specialist",
    department: "Support",
    avatar: "TS",
    icon: Users,
    description: "Provides comprehensive training to school administrators on website management and best practices.",
    isVacant: true
  },
  {
    name: "Vacant",
    role: "Support Manager",
    department: "Support",
    avatar: "SM",
    icon: Headphones,
    description: "Handles ongoing post-launch technical and service support for client schools.",
    isVacant: true
  },
  // Media
  {
    name: "Ansu Sheriff",
    role: "Photographer & Visual Content Creator",
    department: "Media",
    avatar: "AS",
    icon: Megaphone,
    description: "Captures and produces high-quality visual content to support both DSVI's brand and school website presentation.",
    email: "ansu.sheriff@libdsvi.com"
  }
];
export const departments: Department[] = [
  { 
    name: "Leadership", 
    color: "bg-blue-100 text-blue-800", 
    bgColor: "bg-blue-600",
    icon: Briefcase,
    count: teamMembers.filter(member => member.department === "Leadership").length 
  },
  { 
    name: "Operations", 
    color: "bg-green-100 text-green-800", 
    bgColor: "bg-green-600",
    icon: Users,
    count: teamMembers.filter(member => member.department === "Operations").length 
  },
  { 
    name: "IT", 
    color: "bg-purple-100 text-purple-800", 
    bgColor: "bg-purple-600",
    icon: Code,
    count: teamMembers.filter(member => member.department === "IT").length 
  },
  { 
    name: "Support", 
    color: "bg-orange-100 text-orange-800", 
    bgColor: "bg-orange-600",
    icon: Headphones,
    count: teamMembers.filter(member => member.department === "Support").length 
  },
  { 
    name: "Media", 
    color: "bg-pink-100 text-pink-800", 
    bgColor: "bg-pink-600",
    icon: Megaphone,
    count: teamMembers.filter(member => member.department === "Media").length 
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