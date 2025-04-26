from flask import Flask, request, jsonify, session
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from flask_jwt_extended import create_access_token, jwt_required, JWTManager
import psycopg2
from psycopg2.extras import RealDictCursor
import uuid


import os
from ClassInfo import ClassInfo
from CurriculumPlanner import CurriculumPlanner
from Schedule import Schedule
# Create a global schedule object that will persist between requests
global_schedules = {}  # Dictionary to store schedules per user/program

# flask app
app = Flask(__name__)
# CORS app for handling requests from different domains
CORS(app, resources={r"/*": {"origins": "*"}})

# Used for hashing passwords
bcrypt = Bcrypt(app)
# token for token stuff, the key needs to be changed probably
app.config["JWT_SECRET_KEY"] = "supersecretkey"
# JWT for token management
jwt = JWTManager(app)

# Connects to the database (local)
def get_db_connection():
    return psycopg2.connect(
        dbname="localclassmap",
        user="Evan1",
        password="",
        host="localhost"
    )
# def get_db_connection():
#     DATABASE_URL = os.environ.get("DATABASE")  # Render sets this automatically
#     return psycopg2.connect(DATABASE_URL)

# Helper function to get user ID from JWT token
def get_user_id_from_request():
    user_id = None
    auth_header = request.headers.get('Authorization')
    if auth_header and auth_header.startswith('Bearer '):
        # Extract user ID from JWT token
        from flask_jwt_extended import decode_token
        token = auth_header.split(' ')[1]
        try:
            decoded = decode_token(token)
            user_id = str(decoded['sub'].get('UserID', 'anonymous'))
        except:
            user_id = 'anonymous'
    else:
        user_id = 'anonymous'
    return user_id

@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT studentid, password, firstname, lastname FROM Student WHERE studentemail = %s", (email,))
    user = cur.fetchone()
    if user and bcrypt.check_password_hash(user[1], password):
        print("User found")
        user_id = user[0]
        user_name = f"{user[2]} {user[3]}"
        # Create token with user ID in the identity
        access_token = create_access_token(identity={"UserID": user_id, "email": email, "name": user_name})
        
        # Initialize a schedule for this user
        if str(user_id) not in global_schedules:
            global_schedules[str(user_id)] = {}
        
        # Return both token and user information
        return jsonify({
            "access_token": access_token,
            "name": user_name,
            "userId": user_id
        }), 200
    return jsonify({"error": "Invalid credentials"}), 401

@app.route("/SelectSchool")
def get_schools():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT schoolid, schoolname FROM school")
    schools = cur.fetchall()
    return jsonify([{"schoolid": school[0], "schoolname": school[1]} for school in schools]), 200

@app.route("/")
def home():
    return "Home"

# Gets the programs
@app.route("/getPrograms", methods=["GET"])
def getPrograms():
    print("hello")
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT programid, programname FROM program")
    programs = cur.fetchall()
    print(programs)
    return jsonify([{"programid": program[0], "programname": program[1]} for program in programs]), 200

#get classes for a specific program
@app.route("/getProgramClasses/<program_id>", methods=["GET"])
def getProgramClasses(program_id):
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        print("it makes the connection")
        # Query to get classes associated with a program
        cur.execute("""
            SELECT c.courseid, c.department, c.coursenum, c.coursename, c.credits,
                c.requiresmatriculation, c.semestersavailable
            FROM course c
            JOIN degreerequirments dr ON c.courseid = dr.courseid
            WHERE dr.programid = %s
            GROUP BY c.courseid, c.department, c.coursenum, c.coursename,
                    c.credits, c.requiresmatriculation, c.semestersavailable
        """, (program_id,))
        
        classes = cur.fetchall()
        
        # Get prerequisites for each class
        class_data = []
        for cls in classes:
            class_id, department, number, title, credits, requires_matriculation, semesters = cls
            
            # Get prerequisites
            cur.execute("""
                    SELECT p.department, p.coursenum
                    FROM prerequisite pr
                    JOIN course p ON pr.prereqid = p.courseid
                    WHERE pr.courseid = %s
            """, (class_id,))
            
            prerequisites = cur.fetchall()
            prereq_list = [f"{p[0]} {p[1]}" for p in prerequisites]
            
            # Format semesters as list
            
            class_data.append({
                "classid": class_id,
                "department": department,
                "number": number,
                "title": title,
                "name": f"{department} {number}",
                "credits": credits,
                "semesters": semesters,
                "prerequisites": prereq_list,
                "requires_matriculation": requires_matriculation
            })
        
        cur.close()
        conn.close()
        return jsonify(class_data), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# uses the algorithm to generate a schedule that fits the prerequisites and semesters available and stuff
@app.route("/generatePlan/<program_id>", methods=["POST"])
def generate_curriculum_plan(program_id):
    try:
        data = request.get_json()
        start_semester = data.get("startSemester", "Spring")
        start_year = data.get("startYear", 2025)
        
        # Get user ID from token
        user_id = get_user_id_from_request()
            
        # Create key for this user+program combination
        schedule_key = f"{user_id}_{program_id}"
        
        # Get all classes for the program
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Query to get classes with all needed info
        cur.execute("""
            SELECT c.courseid, c.department, c.coursenum, c.coursename, c.credits,
                c.requiresmatriculation, c.semestersavailable
            FROM course c
            JOIN degreerequirments dr ON c.courseid = dr.courseid
            WHERE dr.programid = %s
            GROUP BY c.courseid, c.department, c.coursenum, c.coursename,
                    c.credits, c.requiresmatriculation, c.semestersavailable
        """, (program_id,))
        
        classes = cur.fetchall()
        
        # Initialize a new Schedule object
        global_schedules[schedule_key] = Schedule()
        schedule = global_schedules[schedule_key]
        
        # Create ClassInfo objects and add to drawer
        class_info_objects = []
        for cls in classes:
            class_id, department, number, title, credits, requires_matriculation, semesters = cls
            
            # Get prerequisites
            cur.execute("""
                SELECT p.department, p.coursenum
                FROM prerequisite pr
                JOIN course p ON pr.prereqid = p.courseid
                WHERE pr.courseid = %s
            """, (class_id,))
            
            prerequisites = cur.fetchall()
            prereq_list = [f"{p[0]} {p[1]}" for p in prerequisites]
            
            if isinstance(semesters, str):
                semesters = semesters.strip('{}').split(',')
            semesters = [s.lower() for s in semesters] if semesters else ['fall', 'spring']
            
            # Create ClassInfo object
            class_info_obj = ClassInfo(
                department=department,
                number=number,
                title=title,
                prerequisites=prereq_list,
                semesters=semesters,
                requires_matriculation=requires_matriculation,
            )
            
            # Add to both collections
            class_info_objects.append(class_info_obj)
            schedule.add_to_drawer(class_info_obj)
        
        # Create planner and add classes
        planner = CurriculumPlanner(start_semester=start_semester, start_year=start_year)
        for course in class_info_objects:
            print(course.semesters)
            planner.add_class(course)
        
        # Generate plan
        semester_plan = planner.plan_curriculum()
        print(semester_plan)
        
        # Format plan for frontend and update schedule
        formatted_plan = {}
        scheduled_classes = set()  # Keep track of scheduled classes
        
        for semester_num, courses in semester_plan.items():
            if courses:  # Only include semesters with courses
                semester_name = planner.get_semester_name(semester_num)
                formatted_plan[semester_name] = []
                
                for course_name in courses:
                    # Find the course info
                    course_obj = next((c for c in class_info_objects if c.name == course_name), None)
                    if course_obj:
                        formatted_plan[semester_name].append({
                            "className": course_name,
                            "description": course_obj.title,
                            "prerequisites": course_obj.prerequisites,
                            "requiresMatriculation": course_obj.requires_matriculation,
                            "semesters": course_obj.semesters
                        })
                        
                        # Add to the semester in the schedule
                        schedule.add_to_semester(semester_name, course_obj)
                        scheduled_classes.add(course_name)  # Mark as scheduled
        
        # Now remove scheduled classes from drawer
        # We need to implement this functionality in Schedule class
        # For now, we'll track what's scheduled separately
        schedule.scheduled_classes = scheduled_classes
        
        cur.close()
        conn.close()
        
        return jsonify(formatted_plan), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Modified endpoint to get classes from drawer that aren't in any semester
@app.route("/getAvailableDrawerClasses/<program_id>", methods=["GET"])
def get_available_drawer_classes(program_id):
    try:
        # Get user ID from token
        user_id = get_user_id_from_request()
            
        # Create key for this user+program combination
        schedule_key = f"{user_id}_{program_id}"
        
        # Check if we have a schedule for this user+program
        if schedule_key not in global_schedules:
            # If no schedule exists yet, return all program classes
            return getProgramClasses(program_id)
        
        schedule = global_schedules[schedule_key]
        
        # Create a set of all class names that are in semesters
        scheduled_class_names = getattr(schedule, 'scheduled_classes', set())
        if not scheduled_class_names:
            scheduled_class_names = set()
            for semester, classes in schedule.semesters.items():
                for class_info in classes:
                    scheduled_class_names.add(class_info.name)
            # Store for future reference
            schedule.scheduled_classes = scheduled_class_names
        
        # Get classes from the drawer that aren't scheduled
        available_classes = []
        for class_info in schedule.drawer:
            if class_info.name not in scheduled_class_names:
                available_classes.append({
                    "className": class_info.name,
                    "description": class_info.title,
                    "prerequisites": class_info.prerequisites,
                    "requiresMatriculation": class_info.requires_matriculation,
                    "semesters": class_info.semesters
                })
        
        return jsonify(available_classes), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
# API endpoint to save a schedule
@app.route('/saveSchedule', methods=['POST'])
def save_schedule():
    try:
        # Get request data
        data = request.json
        user_id = data.get('userId')
        program_id = data.get('programId')
        schedule_name = data.get('scheduleName', 'New Schedule')
        schedule_id = data.get('scheduleId')  # May be None for new schedules
        semester_data = data.get('semesterData', {})
        
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # If schedule_id is provided, check if it exists and belongs to the user
        if schedule_id:
            cursor.execute(
                "SELECT * FROM schedule WHERE scheduleid = %s AND studentid = %s",
                (schedule_id, user_id)
            )
            existing_schedule = cursor.fetchone()
            
            if not existing_schedule:
                return jsonify({"error": "Schedule not found or unauthorized"}), 404
            
            # Update existing schedule name if it changed
            cursor.execute(
                "UPDATE schedule SET schedulename = %s WHERE scheduleid = %s",
                (schedule_name, schedule_id)
            )
        else:
            # Create a new schedule
            schedule_id = str(uuid.uuid4())
            cursor.execute(
                "INSERT INTO schedule (scheduleid, schedulename, studentid) VALUES (%s, %s, %s)",
                (schedule_id, schedule_name, user_id)
            )
        
        # Delete existing semesters and their associated courses for this schedule
        # (This is a complete replacement approach)
        cursor.execute(
            "DELETE FROM semester WHERE scheduleid = %s",
            (schedule_id,)
        )
        
        # Create new semesters and add courses
        for semester_name, classes in semester_data.items():
            # Parse semester name to extract season and year
            # Expected format: "Fall 2025", "Spring 2026", etc.
            parts = semester_name.split()
            if len(parts) >= 2:
                season = parts[0].lower()  # Convert to lowercase to match enum type
                try:
                    year = int(parts[1])
                except ValueError:
                    year = 2025  # Default if year can't be parsed
            else:
                season = "fall"  # Default season
                year = 2025      # Default year
            
            # Create semester
            semester_id = str(uuid.uuid4())
            cursor.execute(
                "INSERT INTO semester (semesterid, scheduleid, season, year) VALUES (%s, %s, %s, %s)",
                (semester_id, schedule_id, season, year)
            )
            
            # Add classes to semester
            for class_info in classes:
                class_name = class_info.get('className') or class_info.get('ClassName')
                
                # Find course ID by department and number
                # Split the class name which is usually in format "DEPT 101"
                if class_name and ' ' in class_name:
                    dept, number = class_name.split(' ', 1)
                    
                    cursor.execute(
                        "SELECT courseid FROM course WHERE department = %s AND coursenum = %s",
                        (dept, number)
                    )
                    course_result = cursor.fetchone()
                    
                    if course_result:
                        course_id = course_result['courseid']
                        
                        # Add to semester_course table
                        cursor.execute(
                            "INSERT INTO semestercourse (semesterid, scheduleid, courseid) VALUES (%s, %s, %s)",
                            (semester_id, schedule_id, course_id)
                        )
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({
            "message": "Schedule saved successfully",
            "scheduleId": schedule_id
        }), 200
        
    except Exception as e:
        print(f"Error saving schedule: {str(e)}")
        return jsonify({"error": str(e)}), 500
# API endpoint to get all schedules for a user
@app.route('/getSchedules/<user_id>', methods=['GET'])
def get_schedules(user_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Join with program table to get program names
        cursor.execute("""
            SELECT 
                s.scheduleid as "scheduleId", 
                s.schedulename as "scheduleName", 
                p.programid as "programId", 
                p.programname as "programName" 
            FROM schedule s
            LEFT JOIN studentprogram sp ON s.studentid = sp.studentid
            LEFT JOIN program p ON sp.programid = p.programid
            WHERE s.studentid = %s
        """, (user_id,))
        
        schedules = cursor.fetchall()
        cursor.close()
        conn.close()
        
        return jsonify(schedules), 200
        
    except Exception as e:
        print(f"Error fetching schedules: {str(e)}")
        return jsonify({"error": str(e)}), 500
# API endpoint to get classes for a specific schedule
@app.route('/getScheduleClasses/<schedule_id>', methods=['GET'])
def get_schedule_classes(schedule_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Get all semester IDs for this schedule
        cursor.execute(
            "SELECT semesterid, season, year FROM semester WHERE scheduleid = %s",
            (schedule_id,)
        )
        semesters = cursor.fetchall()
        
        result = {}
        
        # For each semester, get the courses
        for sem in semesters:
            semester_id = sem['semesterid']
            semester_name = sem['season'].capitalize() + " " + str(sem['year'])
            
            # Get all courses in this semester
            cursor.execute("""
                SELECT c.courseid, c.department, c.coursenum, c.coursename as title, 
                       c.credits, c.requiresmatriculation, c.semestersavailable
                FROM semestercourse sc
                JOIN course c ON sc.courseid = c.courseid
                WHERE sc.semesterid = %s AND sc.scheduleid = %s
            """, (semester_id, schedule_id))
            
            courses = cursor.fetchall()
            formatted_courses = []
            
            for course in courses:
     
                prereq_list = None
                
                # Format course data to match generatePlan output
                formatted_course = {
                    "className": f"{course['department']} {course['coursenum']}",
                    "description": course['title'],
                    "credits": course['credits'],
                    "prerequisites": prereq_list,
                    "semesters": course['semestersavailable'] 
                        if isinstance(course['semestersavailable'], list) 
                        else (course['semestersavailable'].strip('{}').split(',') 
                            if course['semestersavailable'] else []),
                    "requiresMatriculation": course['requiresmatriculation']
                }
                
                formatted_courses.append(formatted_course)
            
            result[semester_name] = formatted_courses
        
        cursor.close()
        conn.close()
        
        return jsonify(result), 200
        
    except Exception as e:
        print(f"Error fetching schedule classes: {str(e)}")
        return jsonify({"error": str(e)}), 500

# port configuration
port = int(os.environ.get("PORT", 5000))

# Run the app
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=port)