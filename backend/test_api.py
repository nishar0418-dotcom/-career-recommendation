import urllib.request
import json

BASE = 'http://127.0.0.1:5000/api'

def req(path, data=None, token=None):
    url = BASE + path
    headers = {'Content-Type': 'application/json'}
    if token:
        headers['Authorization'] = f'Bearer {token}'
    req_obj = urllib.request.Request(url, headers=headers)
    if data is not None:
        req_obj.data = json.dumps(data).encode('utf-8')
    with urllib.request.urlopen(req_obj) as res:
        return json.loads(res.read().decode())

print("1. Testing Student Login...")
res = req('/login', {'email': 'student@careermatch.ai', 'password': 'Student@123'})
student_token = res['token']
print("   -> Success! Student:", res['user']['name'])

print("2. Testing Admin Login...")
res = req('/login', {'email': 'admin@careermatch.ai', 'password': 'Admin@123'})
admin_token = res['token']
print("   -> Success! Admin:", res['user']['name'])

print("3. Testing Profile Retrieval...")
prof = req('/student/profile', token=student_token)
print(f"   -> Success! CGPA: {prof['profile']['cgpa']}, Skills: {len(prof['skills'])} skills, Projects: {len(prof['projects'])}")

print("4. Testing AI Profile Diagnostics...")
ai_res = req('/analyze-profile', data={}, token=student_token)
print(f"   -> Success! Strength: {ai_res['profile_strength']}%, Top Role: {ai_res['top_career_role']}, Suggested Domain: {ai_res['suggested_career_domain']}")

print("5. Testing Recommendations Ranking...")
recs = req('/recommendations', token=student_token)
top_rec = recs['recommendations'][0]
print(f"   -> Success! Found {recs['count']} matches. Top: {top_rec['title']} at {top_rec['company']} ({top_rec['match_percentage']}%)")

print("6. Testing Skill Gap Analysis...")
gaps = req('/skill-gaps', token=student_token)
print(f"   -> Success! Total skills: {gaps['summary']['total_student_skills']}, Missing: {gaps['summary']['total_missing_skills']}, Roadmaps: {len(gaps['learning_recommendations'])}")

print("7. Testing Career Roles Archetypes...")
roles = req('/career-roles', token=student_token)
print(f"   -> Success! Benchmarked {len(roles['career_roles'])} archetypes. Top: {roles['career_roles'][0]['role']} ({roles['career_roles'][0]['suitability']}%)")

print("8. Testing Admin Stats...")
stats = req('/admin/stats', token=admin_token)
print(f"   -> Success! Total students: {stats['stats']['total_students']}, Total opps: {stats['stats']['total_opportunities']}")
print("\n>>> ALL API VERIFICATIONS PASSED WITH 100% SUCCESS! <<<")
