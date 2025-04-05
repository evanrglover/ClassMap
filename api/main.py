from flask import Flask, request, jsonify
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from flask_jwt_extended import create_access_token, jwt_required, JWTManager
import psycopg2
import os
from ClassInfo import ClassInfo
from CurriculumPlanner import CurriculumPlanner

# flask app
app = Flask(__name__)
# CORS app for handling requests from different domains
CORS(app)
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
            print("it fails here")
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
        
        # Get all classes for the program
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Query to get classes with all needed info
        cur.execute("""
            SELECT c.courseid, c.department, c.coursenum, c.coursename, c.credits,
                c.requiresmatriculation, c.seasons
            FROM course c
            JOIN degreerequirments dr ON c.courseid = dr.courseid
            WHERE dr.programid = %s
            GROUP BY c.courseid, c.department, c.coursenum, c.coursename,
                    c.credits, c.requiresmatriculation, c.semestersavailable
        """, (program_id,))
        
        classes = cur.fetchall()
        
        # Create ClassInfo objects
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
            
            # Get semesters when the course is offered
            cur.execute("""
                SELECT semester
                FROM coursesemester
                WHERE courseid = %s
            """, (class_id,))
            
            semesters_data = cur.fetchall()
            semesters = [s[0].lower() for s in semesters_data] if semesters_data else ['fall', 'spring']
            
            # Create ClassInfo object
            class_info_obj = ClassInfo(
                department=department,
                number=number,
                title=title,
                prerequisites=prereq_list,
                semesters=semesters,
                requires_matriculation=requires_matriculation,
            )
            
            class_info_objects.append(class_info_obj)
        
        # Create planner and add classes
        planner = CurriculumPlanner(start_semester=start_semester, start_year=start_year)
        for course in class_info_objects:
            planner.add_class(course)
        
        # Generate plan
        semester_plan = planner.plan_curriculum()
        
        # Format plan for frontend
        formatted_plan = {}
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
        
        cur.close()
        conn.close()
        
        return jsonify(formatted_plan), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500



# port configuration
port = int(os.environ.get("PORT", 5000))

# Run the app
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=port)