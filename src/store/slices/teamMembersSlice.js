import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  teamMembers: [
    {
      id: '1',
      name: 'Sarah Johnson',
      role: 'Project Manager',
      position: 'Project Manager',
      email: 'sarah.johnson@company.com',
      phone: '+1 (555) 123-4567',
      bio: 'Experienced project manager with 8+ years in technology solutions',
      skills: 'Project Management, Agile, Scrum, Risk Management',
      experience: '8+ years of project management experience in technology solutions',
      cv: `<h3>Sarah Johnson - Project Manager</h3>
<ul>
<li>MBA in Technology Management</li>
<li>PMP Certified</li>
<li>Led 50+ successful technology projects</li>
<li>Expertise in Agile and Waterfall methodologies</li>
<li>Strong stakeholder management and communication skills</li>
</ul>`,
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Michael Chen',
      role: 'Lead Developer',
      position: 'Lead Developer',
      email: 'michael.chen@company.com',
      phone: '+1 (555) 234-5678',
      bio: 'Senior full-stack developer with expertise in modern web technologies',
      skills: 'React, Node.js, Python, AWS, Docker',
      experience: 'Senior full-stack developer with expertise in modern web technologies',
      cv: `<h3>Michael Chen - Lead Developer</h3>
<ul>
<li>B.S. Computer Science</li>
<li>6+ years full-stack development experience</li>
<li>Expert in React, Node.js, and cloud technologies</li>
<li>Led development teams of 5+ developers</li>
<li>AWS Certified Solutions Architect</li>
</ul>`,
      createdAt: new Date().toISOString()
    },
    {
      id: '3',
      name: 'Emily Rodriguez',
      role: 'UX/UI Designer',
      position: 'UX/UI Designer',
      email: 'emily.rodriguez@company.com',
      phone: '+1 (555) 345-6789',
      bio: 'Creative designer specializing in user-centered design principles',
      skills: 'UI/UX Design, Figma, Adobe Creative Suite, User Research',
      experience: 'Creative designer specializing in user-centered design principles',
      cv: `<h3>Emily Rodriguez - UX/UI Designer</h3>
<ul>
<li>B.A. in Graphic Design</li>
<li>5+ years UX/UI design experience</li>
<li>Expert in Figma, Adobe Creative Suite</li>
<li>Conducted 100+ user research sessions</li>
<li>Designed award-winning mobile and web applications</li>
</ul>`,
      createdAt: new Date().toISOString()
    },
    {
      id: '4',
      name: 'David Kim',
      role: 'Quality Assurance',
      position: 'QA Specialist',
      email: 'david.kim@company.com',
      phone: '+1 (555) 456-7890',
      bio: 'QA specialist ensuring robust and reliable solutions',
      skills: 'Test Automation, Selenium, Jest, Quality Assurance',
      experience: 'QA specialist ensuring robust and reliable solutions',
      cv: `<h3>David Kim - Quality Assurance</h3>
<ul>
<li>B.S. in Software Engineering</li>
<li>4+ years QA and testing experience</li>
<li>Expert in automated testing frameworks</li>
<li>Implemented CI/CD testing pipelines</li>
<li>Reduced bug reports by 60% through comprehensive testing</li>
</ul>`,
      createdAt: new Date().toISOString()
    }
  ],
};

const teamMembersSlice = createSlice({
  name: 'teamMembers',
  initialState,
  reducers: {
    setTeamMembers: (state, action) => {
      state.teamMembers = action.payload;
    },
    addTeamMember: (state, action) => {
      const newTeamMember = {
        ...action.payload,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      };
      state.teamMembers.push(newTeamMember);
    },
    updateTeamMember: (state, action) => {
      const { id, updates } = action.payload;
      const memberIndex = state.teamMembers.findIndex(member => member.id === id);
      if (memberIndex !== -1) {
        state.teamMembers[memberIndex] = {
          ...state.teamMembers[memberIndex],
          ...updates,
          updatedAt: new Date().toISOString()
        };
      }
    },
    deleteTeamMember: (state, action) => {
      const id = action.payload;
      state.teamMembers = state.teamMembers.filter(member => member.id !== id);
    },
  },
});

export const {
  setTeamMembers,
  addTeamMember,
  updateTeamMember,
  deleteTeamMember,
} = teamMembersSlice.actions;

export default teamMembersSlice.reducer;