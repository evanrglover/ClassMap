from typing import List

class ClassInfo:
    def __init__(self, department: str, number: str, title: str, prerequisites: List[str] = None, semesters: List[str] = None, requires_matriculation: bool = False):
        self.department = department
        self.number = number
        self.title = title
        self.name = f"{department} {number}"
        self.prerequisites = prerequisites or []
        self.semesters = semesters or ['fall', 'spring', 'summer']
        self.requires_matriculation = requires_matriculation
