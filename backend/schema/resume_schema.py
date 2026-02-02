
# --- Pydantic models matching the resume schema ---
class Skill(BaseModel):
    name: str
    category: str

class JobExperience(BaseModel):
    company: str
    role: str
    dates: str
    location: Optional[str] = None
    responsibilities: Optional[str] = None

class Education(BaseModel):
    institution: str
    degree: str
    year: str

class Achievement(BaseModel):
    description: Optional[str] = None
    link: Optional[HttpUrl] = None

class SocialEngagement(BaseModel):
    organization: Optional[str] = None
    role: Optional[str] = None
    description: Optional[str] = None

class Project(BaseModel):
    name: str
    description: Optional[str] = None
    technologies: Optional[List[str]] = None
    github_url: Optional[HttpUrl] = None
    deployed_project_url: Optional[HttpUrl] = None

class Profile(BaseModel):
    full_name: str
    email: str
    phone: Optional[str] = None
    linkedin_url: Optional[HttpUrl] = None
    github_url: Optional[HttpUrl] = None
    portfolio_url: Optional[HttpUrl] = None
    summary: Optional[str] = None
    skills: Optional[List[Skill]] = []
    experience: Optional[List[JobExperience]] = []
    education: Optional[List[Education]] = []
    achievements: Optional[List[Achievement]] = []
    social_engagements: Optional[List[SocialEngagement]] = []
    projects: Optional[List[Project]] = []
    meta: Optional[dict] = None
