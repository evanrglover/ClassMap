import networkx as nx
from typing import List, Dict, Set
from datetime import datetime
from ClassInfo import ClassInfo

# class ClassInfo:
#     def __init__(self, department: str, number: str, title: str, prerequisites: List[str] = None, semesters: List[str] = None, requires_matriculation: bool = False):
#         self.department = department
#         self.number = number
#         self.title = title
#         self.name = f"{department} {number}"
#         self.prerequisites = prerequisites or []
#         self.semesters = semesters or ['fall', 'spring', 'summer']
#         self.requires_matriculation = requires_matriculation

class CurriculumPlanner:
    
    def __init__(self, start_semester="Spring", start_year=2025):
        self.dependency_graph = nx.DiGraph()
        self.classes: Dict[str, ClassInfo] = {}
        self.matriculation_courses = {"CS 1400", "CS 1410", "CS 2300", "CS 2420", "CS 2450", "MATH 1210"}
        self.semester_plan = {i: [] for i in range(1, 13)}  # Increase to handle more semesters including summers
        self.max_classes_per_semester = 5
        self.start_semester = start_semester
        self.start_year = start_year
    
    def add_class(self, class_info: ClassInfo):
        self.classes[class_info.name] = class_info
        self.dependency_graph.add_node(class_info.name)
        for prereq in class_info.prerequisites:
            self.dependency_graph.add_edge(prereq, class_info.name)
    
    def plan_curriculum(self):
        try:
            sorted_classes = list(nx.topological_sort(self.dependency_graph))
        except nx.NetworkXUnfeasible:
            raise ValueError("Circular dependency detected!")
        
        # Track completed courses and courses completed in the current semester
        completed_before_current_semester = set()
        completed_courses = set()
        matriculation_obtained = False
        semester = 1
        
        while sorted_classes and semester <= 12:  # Increased max semesters
            # At the start of a new semester, update the completed courses from previous semesters
            completed_before_current_semester = completed_courses.copy()
            
            # Check if we have matriculation based on courses completed before this semester
            if self.matriculation_courses.issubset(completed_before_current_semester):
                matriculation_obtained = True
                
            scheduled_this_semester = 0
            remaining_classes = sorted_classes.copy()
            current_semester_classes = []
            
            # Get the current semester season
            current_season = self._get_semester_season(semester)
            
            for cls in sorted_classes:
                # Skip if we've reached the maximum classes for this semester
                if scheduled_this_semester >= self.max_classes_per_semester:
                    break
                    
                course = self.classes[cls]
                
                # Skip if matriculation is required but not obtained
                if course.requires_matriculation and not matriculation_obtained:
                    continue
                    
                # Skip if prerequisites are not met by courses from PREVIOUS semesters
                if not all(prereq in completed_before_current_semester for prereq in course.prerequisites):
                    continue
                    
                # Skip if the course is not available in this semester
                if not self._check_semester_availability(course, semester):
                    continue
                    
                # Schedule the course
                current_semester_classes.append(cls)
                completed_courses.add(cls)
                remaining_classes.remove(cls)
                scheduled_this_semester += 1
            
            # Add all scheduled classes to the semester plan
            self.semester_plan[semester] = current_semester_classes
            
            # Update the classes list for next iteration
            sorted_classes = remaining_classes
            
            # Move to the next semester
            semester += 1
        
        return self.semester_plan
    
    def _get_semester_season(self, semester_number):
        """
        Maps semester number to season (spring, summer, fall) based on starting semester
        """
        # Calculate offset based on starting semester
        if self.start_semester.lower() == "spring":
            offset = 0
        elif self.start_semester.lower() == "summer":
            offset = 1
        elif self.start_semester.lower() == "fall":
            offset = 2
        else:
            offset = 0  # Default to spring if invalid
        
        # Calculate the season index (0=spring, 1=summer, 2=fall)
        season_index = (semester_number - 1 + offset) % 3
        
        if season_index == 0:
            return "spring"
        elif season_index == 1:
            return "summer"
        else:
            return "fall"
    
    def _get_semester_year(self, semester_number):
        """
        Calculate the year of a semester based on starting year and semester number
        """
        # Calculate offset based on starting semester
        if self.start_semester.lower() == "spring":
            offset = 0
        elif self.start_semester.lower() == "summer":
            offset = 1
        elif self.start_semester.lower() == "fall":
            offset = 2
        else:
            offset = 0  # Default to spring if invalid
        
        # Calculate years to add to starting year
        seasons_passed = semester_number - 1 + offset
        years_to_add = seasons_passed // 3
        
        return self.start_year + years_to_add
    
    def _check_semester_availability(self, course: ClassInfo, semester: int) -> bool:
        """
        Check if a course is available in the given semester
        """
        current_season = self._get_semester_season(semester)
        return current_season in course.semesters
    
    def get_semester_name(self, semester_number):
        """
        Returns a formatted semester name like "Spring 2025"
        """
        season = self._get_semester_season(semester_number)
        year = self._get_semester_year(semester_number)
        return f"{season.capitalize()} {year}"
    
    def print_curriculum(self):
        print("Curriculum Semester Plan:")
        for semester in range(1, 13):
            semester_name = self.get_semester_name(semester)
            classes = self.semester_plan[semester]
            
            # Always print all semesters, even if empty
            if classes:
                print(f"{semester_name}: {', '.join(classes)}")
            else:
                print(f"{semester_name}: (None)")

def main():
    class_info = [
    ClassInfo("CS", "1400", "Fundamentals of Programming", semesters=['fall', 'spring']),
    ClassInfo("CS", "1410", "Object Oriented Programming", ["CS 1400"], semesters=['fall', 'spring']),
    ClassInfo("CS", "3250", "Java Programming", ["CS 1400"], semesters=['fall', 'spring']),
    ClassInfo("CS", "2300", "Discrete Mathematical Structures I", ["CS 1410"], semesters=['fall', 'spring']),
    ClassInfo("CS", "3240", "Discrete Mathematical Structures II", ["CS 2300", "CS 2420", "CS 2810"], semesters=['fall', 'spring'], requires_matriculation=True),
    ClassInfo("CS", "2370", "C++ Programming", ["CS 1410"], semesters=['fall', 'spring']),
    ClassInfo("CS", "2420", "Introduction to Algorithms and Data Structures", ["CS 1410"], semesters=['fall', 'spring']),
    ClassInfo("CS", "2450", "Software Engineering", ["CS 2300", "CS 2420"], semesters=['fall', 'spring']),
    ClassInfo("CS", "2550", "Web Programming I", ["CS 1410"], semesters=['fall', 'spring']),
    ClassInfo("CS", "2600", "Computer Networks I", ["CS 2810"], semesters=['fall', 'spring']),
    ClassInfo("CS", "2810", "Computer Architecture", ["CS 1410"], semesters=['fall', 'spring']),
    ClassInfo("CS", "3520", "Database Theory", ["CS 2300", "CS 2420"], semesters=['fall', 'spring'], requires_matriculation=True),
    ClassInfo("CS", "4450", "Analysis of Programming Languages", ["CS 3250"], semesters=['fall', 'spring'], requires_matriculation=True),
    ClassInfo("CS", "4400", "Software Engineering II", ["CS 2450", "CS 2600", "CS 3520", "CS 3250"], semesters=['fall', 'spring'], requires_matriculation=True),
    ClassInfo("CS", "305g", "Ethical and Social Issues in Computing",["CS 1410"] ,semesters=['fall', 'spring']),
    ClassInfo("CS", "3060", "Operating Systems Theory", ["CS 2370", "CS 2420", "CS 2810"], semesters=['fall', 'spring'], requires_matriculation=True), 
    ClassInfo("CS", "3100", "Data Privacy and Security", ["CS 2420"], semesters=['fall', 'spring']),
    ClassInfo("CS", "3320", "Numerical Software Development", semesters=['fall', 'spring'], requires_matriculation=True),
    ClassInfo("CS", "3450", "Principles and Patterns of Software Design", ["CS 3250"], semesters=['fall', 'spring']),
    ClassInfo("CS", "4230", "Software Testing and Quality Engineering", ["CS 2450", "CS 3250"], semesters=['fall', 'spring'], requires_matriculation=True), 

    ClassInfo("ENGL", "1010", "Introduction to Writing", semesters=['fall', 'spring']),
    ClassInfo("ENGL", "2010", "Intermediate Writing", ["ENGL 1010"], semesters=['fall', 'spring']),
    ClassInfo("POLS", "1000", "American Heritage", semesters=['fall', 'spring']),
    ClassInfo("MATH", "1210", "Calculus I", semesters=['fall', 'spring']),
    ClassInfo("PHIL", "2050", "Ethics and Values", semesters=['fall', 'spring', 'summer']),
    ClassInfo("HLTH", "1100", "Personal Health and Wellness", semesters=['fall', 'spring']),
    ClassInfo("COMM", "1020", "Public Speaking", semesters=['fall', 'spring']),
    ClassInfo("MUSC", "1010", "Intro to Music", semesters=['fall', 'spring']),
    ClassInfo("PSY", "1010", "General Psychology", semesters=['fall', 'spring']),
    ClassInfo("BIOL", "1010", "General Biology", semesters=['fall', 'spring']),
    ClassInfo("CHEM", "1210", "Principles of Chem", semesters=['fall', 'spring']),
    ClassInfo("CHEM", "1215", "Principles of Chem Lab", semesters=['fall', 'spring']),
    ]

    # Create the planner with Spring 2025 as the starting semester
    planner = CurriculumPlanner(start_semester="Spring", start_year=2025)
    
    for course in class_info:
        planner.add_class(course)
    
    planner.plan_curriculum()
    planner.print_curriculum()

if __name__ == "__main__":
    main()