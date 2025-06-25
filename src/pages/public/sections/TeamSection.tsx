import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';
import { teamMembers, departments } from '@/data/teamData';

export const TeamSection: React.FC = () => {

  return (
    <section className="py-24 bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-20">
          <Badge className="mb-6 bg-blue-100 text-blue-800 hover:bg-blue-200 px-6 py-2 text-lg">
            <Users className="mr-2 h-5 w-5" />
            Meet Our Team
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            The People Behind DSVI
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Our dedicated team of education technology specialists, developers, and support professionals 
            work tirelessly to bring Liberian schools into the digital age.
          </p>
        </div>

        {/* Department Overview */}
        <div className="flex flex-wrap justify-center gap-4 mb-16">
          {departments.map((dept, index) => (
            <Badge key={index} className={`${dept.color} px-4 py-2 text-sm font-medium`}>
              {dept.name} ({dept.count})
            </Badge>
          ))}
        </div>

        {/* Team Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {teamMembers.map((member, index) => {
            const IconComponent = member.icon;
            return (
              <Card key={index} className={`border-none shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-white ${member.isVacant ? 'opacity-75' : ''}`}>
                <CardContent className="p-8 text-center">
                  <div className="relative mb-6">
                    {member.hasPhoto ? (
                      <div className="w-20 h-20 rounded-full mx-auto mb-4 overflow-hidden border-4 border-gradient-to-br from-blue-600 to-green-600">
                        <img 
                          src={member.name === "B. K. Weah, Jr." ? "/updates_assets/B. K. Weah Pro.jpg" : 
                               member.name === "John Gyawu" ? "/updates_assets/MR. JOHN GYAWU.jpg" : 
                               ""} 
                          alt={member.name}
                          className="w-full h-full object-cover object-top"
                          style={{ objectPosition: '50% 0%' }}
                        />
                      </div>
                    ) : (
                      <div className={`w-20 h-20 ${member.isVacant ? 'bg-gray-400' : 'bg-gradient-to-br from-blue-600 to-green-600'} rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl`}>
                        {member.isVacant ? '?' : member.avatar}
                      </div>
                    )}
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                      <IconComponent className="h-4 w-4 text-gray-600" />
                    </div>
                  </div>
                  <h3 className={`text-xl font-bold mb-2 ${member.isVacant ? 'text-gray-500' : 'text-gray-900'}`}>
                    {member.name}
                  </h3>
                  <p className={`font-semibold mb-1 ${member.isVacant ? 'text-gray-400' : 'text-blue-600'}`}>{member.role}</p>
                  <Badge className={`mb-4 text-xs ${member.isVacant ? 'bg-gray-200 text-gray-600' : 'bg-gray-100 text-gray-700'}`}>
                    {member.department}
                  </Badge>
                  <p className={`text-sm leading-relaxed ${member.isVacant ? 'text-gray-500' : 'text-gray-600'}`}>
                    {member.description}
                  </p>
                  {member.isVacant && (
                    <p className="text-xs text-red-500 mt-2 font-medium">Position Available</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
