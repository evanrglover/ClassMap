import React from 'react';

class ClassInfo {
    constructor(department, number, title, prerequisites = [], semesters = [], credits = 0, requires_matriculation = false) {
        this.department = department;
        this.number = number;
        this.title = title;
        this.name = `${department} ${number}`;
        this.prerequisites = prerequisites;
        this.credits = credits;
        this.requires_matriculation = requires_matriculation;
        this.semesters = semesters;

    }

    static fromApiData(classData) {
        return new ClassInfo(
            classData.department,
            classData.number,
            classData.title,
            classData.prerequisites || [],
            classData.credits || 0,
            classData.requires_matriculation || false,
            classData.semesters || ['fall', 'spring', 'summer']

        );
    }

    meetsPrerequisites(completedClasses) {
        if (!this.prerequisites || this.prerequisites.length === 0) {
            return true;
        }
        
        return this.prerequisites.every(prereq => 
            completedClasses.some(cls => `${cls.department} ${cls.number}` === prereq)
        );
    }

    isAvailableInSemester(semester) {
        return this.semesters.includes(semester.toLowerCase());
    }
}

export default ClassInfo;