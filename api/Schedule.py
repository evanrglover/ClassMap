from typing import List, Dict
from ClassInfo import ClassInfo

class Schedule:
    def __init__(self):
        self.drawer = []  # List of ClassInfo objects
        self.semesters = {}  # Dictionary of semester: [ClassInfo objects]
    
    def add_to_drawer(self, class_info: ClassInfo):
        """Add a ClassInfo object to the drawer"""
        self.drawer.append(class_info)
    
    def add_to_semester(self, semester_name: str, class_info: ClassInfo):
        """Add a ClassInfo object to a specific semester"""
        if semester_name not in self.semesters:
            self.semesters[semester_name] = []
        self.semesters[semester_name].append(class_info)
    
    def clear_semesters(self):
        """Clear all semesters but keep the drawer"""
        self.semesters = {}
    
    def get_class_by_name(self, class_name: str):
        """Get a class from the drawer by its name"""
        for class_info in self.drawer:
            if class_info.name == class_name:
                return class_info
        return None