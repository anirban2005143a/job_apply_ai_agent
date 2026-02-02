import uuid
from graph import agent_executor
from langgraph.types import Command

# 1. Create a unique session ID for this test
thread_id = str(uuid.uuid4())
config = {"configurable": {"thread_id": thread_id}}

# 2. Mock User Data (Similar to what you have in MongoDB)
initial_input = {
    "user_profile": {
        "hasVisa": "yes",
        "visaType": "PR",
        "visaCountries": [
            {
            "value": "Anguilla",
            "label": "Anguilla"
            },
            {
            "value": "India",
            "label": "India"
            },
            {
            "value": "Indonesia",
            "label": "Indonesia"
            }
        ],
        "workMode": [
            {
            "value": "Hybrid",
            "label": "Hybrid"
            },
            {
            "value": "Remote",
            "label": "Remote"
            }
        ],
        "cityPreference": [
            {
            "value": "Kolkata",
            "label": "Kolkata"
            },
            {
            "value": "Mumbai",
            "label": "Mumbai"
            },
            {
            "value": "Delhi",
            "label": "Delhi"
            }
        ],
        "countryPreference": [
            {
            "value": "India",
            "label": "India"
            },
            {
            "value": "Ecuador",
            "label": "Ecuador"
            }
        ],
        "companyPreference": "google , ",
        "blacklistedCompanies": "facebook",
        "salaryFloor": "23333",
        "companyType": {
            "value": "Startup",
            "label": "Startup"
        },
        "industryPreference": "tech",
        "yearsOfExperience": "2",
        "applicationsPerDay": "10",
        # "minConfidence": "80",
        "full_name": "Anirban Das",
        "email": "dasanirban268@gmail.com",
        "phone": "6290375587",
        "linkedin_url": "https://www.linkedin.com/in/anirban-das-2014412b9/",
        "github_url": "https://github.com/anirban2005143a",
        "summary": "Highly motivated and detail-oriented software developer with a strong background in computer science and engineering. Proficient in a range of programming languages, including C++, JavaScript, and Python. Experience in building scalable and efficient frontend applications using React and Tailwind CSS.",
        "skills": [
            {
            "name": "C++",
            "priority": 1
            },
            {
            "name": "C",
            "priority": 2
            },
            {
            "name": "HTML",
            "priority": 3
            },
            {
            "name": "JavaScript",
            "priority": 4
            },
            {
            "name": "React.js",
            "priority": 5
            },
            {
            "name": "Next.js",
            "priority": 6
            },
            {
            "name": "Express.js",
            "priority": 7
            },
            {
            "name": "Docker",
            "priority": 8
            },
            {
            "name": "Tailwind CSS",
            "priority": 9
            },
            {
            "name": "Bootstrap",
            "priority": 10
            },
            {
            "name": "Node.js",
            "priority": 11
            },
            {
            "name": "Three.js",
            "priority": 12
            },
            {
            "name": "gsap",
            "priority": 13
            },
            {
            "name": "Firebase",
            "priority": 14
            },
            {
            "name": "MongoDB",
            "priority": 15
            },
            {
            "name": "PostgreSQL",
            "priority": 16
            }
        ],
        "experience": [
            {
            "company": "Gofloww",
            "role": "Frontend Developer Intern",
            "dates": "May 2025 – July 2025",
            "location": "India",
            "responsibilities": "Built and deployed the Atom Accounting App as the primary frontend developer using React and Tailwind CSS. Collaborated with the backend team to integrate REST APIs, ensuring seamless user interactions and real-time data updates. Implemented responsive UI components and form handling features, improving overall user experience and reducing bounce rate.",
            "priority": 1
            }
        ],
        "education": [
            {
            "institution": "Indian Institute of Technology (Indian School of Mines), Dhanbad",
            "degree": "Bachelor of Technology in Computer Science and Engineering",
            "year": "Expected May 2027",
            "gpa": "8.25 / 10.00",
            "location": "Dhanbad, Jharkhand",
            "relevant_coursework": [
                "Data Structures and Algorithms (C++)",
                "Computer Organization",
                "Computer Architecture",
                "Operating Systems"
            ],
            "priority": 1
            }
        ],
        "achievements": [
            {
            "description": "Secured 4th rank at HaXplore Codefest25 organized by IIT BHU!",
            "link": "https://docs.google.com/spreadsheets/d/1DGnk_THhh_8MD08PnzT_9JA60gsCexhAZd-H27VzO4s/edit?gid=0#gid=0",
            "priority": 1
            },
            {
            "description": "Winner of Winter Of Code 6.O (in Web Development Division) a one-month long hackathon conducted by CyberLabs, IIT(ISM) Dhanbad.",
            "link": "https://movieflix2005.netlify.app/",
            "priority": 2
            },
            {
            "description": "Achieved an All India Rank (AIR) 235 among approximately 0.125 million candidates in West Bengal Joint Entrance Examination (WBJEE) 2023.",
            "link": "https://drive.google.com/file/d/1y6GgPeiB0iyOHcloUKO0Z1ldLJ8h9iaB/view?usp=sharing",
            "priority": 3
            },
            {
            "description": "Secured 99.14 percentile, ranking among the top 0.86% of 1.16 million candidates in JEE Mains 2023.",
            "link": "https://drive.google.com/file/d/1vw0pPxcRp2NV23bN2RtRHEe4W7ssA_Tu/view?usp=sharing",
            "priority": 4
            }
        ],
        "social_engagements": [
            {
            "organization": "CyberLabs -Tech society of IIT ISM Dhanbad",
            "role": "Member",
            "priority": 1
            },
            {
            "organization": "Aquatics Team - Swimming Team of IIT ISM Dhanbad",
            "role": "Member",
            "priority": 2
            },
            {
            "organization": "IIT Dhanbad",
            "role": "Represented at the 37th INTER IIT AQUATICS MEET 2023",
            "description": "Secured 4th place in 200m Individual Medley",
            "priority": 3
            }
        ],
        "projects": [
            {
            "name": "Code Fusion",
            "description": "An online code editor supporting real-time collaboration, multiple languages, and customizable themes.",
            "technologies": [
                "React.js",
                "Flask",
                "Express.js",
                "MongoDB",
                "Tailwind CSS"
            ],
            "github_url": "https://github.com/anirban2005143a/code-Fusion",
            "deployed_project": "https://code-fusion-code-collab.vercel.app/",
            "priority": 1
            },
            {
            "name": "NoteBridge",
            "description": "A feature-rich note-taking and sharing platform that enables structured organization through folders, facilitates seamless file sharing with controlled access.",
            "technologies": [
                "React.js",
                "Express.js",
                "MongoDB",
                "Bootstrap"
            ],
            "github_url": "https://github.com/anirban2005143a/note-bridge",
            "deployed_project": "https://notebridge.vercel.app/",
            "priority": 2
            }
        ],
        "sport_programming": [
            {
            "platform": "LeetCode",
            "description": "Solved 100+ problems focusing on data structures and algorithms.",
            "user": "aswU2SZvDg",
            "priority": 1
            },
            {
            "platform": "CodeForces",
            "description": "Solved 180+ problems improving competitive programming skills.",
            "user": "anirban2005",
            "priority": 2
            }
        ],
    },
    "messages": [{"role": "user", "content": "Start my job search."}],
    "results": [],
    "daily_app_count": 0,
    "current_clarify_index": 0,
    "direct_apply_queue": [],
    "clarification_queue": [],
    "rejected_jobs": []
}

def run_test():
    print(f"--- Starting Agent Session: {thread_id} ---")
    
    # Start the initial run
    events = agent_executor.invoke(initial_input, config=config)
    
    # Loop to handle Interrupts (Human-in-the-loop)
    while True:
        state = agent_executor.get_state(config)
        
        # Check if the agent is "Waiting" for human input
        if state.next:
            # Get the question from the interrupt information
            # state.tasks[0].interrupts[0].value contains the dict we sent in the node
            interrupt_data = state.tasks[0].interrupts[0].value
            print(state.tasks[0].interrupts[0])
            # prin()
            print(f"\n[AI QUESTION]: {interrupt_data['question']}")
            
            user_response = input("Your Answer (or type 'quit' to stop): ")
            
            if user_response.lower() == 'quit':
                break
                
            # Resume the graph with the user's input
            agent_executor.invoke(Command(resume=user_response), config=config)
        else:
            # If state.next is empty, the graph has reached END
            print("\n--- Flow Complete ---")
            final_state = agent_executor.get_state(config).values
            print(f"Total Applications: {final_state['daily_app_count']}")
            # print(f"Final State: {final_state}")
            print(f"Applied to: {[r['jobId'] for r in final_state['results']]}")
            break

if __name__ == "__main__":
    run_test()