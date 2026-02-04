import json
import os
from dotenv import load_dotenv
from langchain_huggingface import HuggingFaceEndpointEmbeddings
from langchain_chroma import Chroma
from langchain_core.documents import Document
from langchain_community.retrievers import BM25Retriever

load_dotenv()

# Initialize Hugging Face Embeddings
# 'all-MiniLM-L6-v2' is fast and effective for job matching
embeddings = HuggingFaceEndpointEmbeddings(
    model="sentence-transformers/all-MiniLM-L6-v2",
    huggingfacehub_api_token= os.getenv('HF_TOKEN')
)

bm25_retriever = None

def init_bm25(vector_db):
    global bm25_retriever
    data = vector_db.get()
    docs = [
        Document(page_content=d, metadata=m)
        for d, m in zip(data["documents"], data["metadatas"])
    ]
    bm25_retriever = BM25Retriever.from_documents(docs)
    bm25_retriever.k = 20


def initialize_job_store(json_file_path, persist_directory="./job_chroma_db"):
    # 1. Load JSON data
    with open(json_file_path, 'r') as f:
        jobs_data = json.load(f)
    
    # 2. Convert JSON objects to LangChain Documents
    # We combine key fields into 'page_content' for the embedding model to read
    documents = []
    for job in jobs_data:
        # Create a string representation for embedding
        # The ideal structure for your specific job data
        content = (
            f"Job Title: {job.get('title')}\n"
            f"Company: {job.get('company')}\n"
            f"Location: {', '.join(job.get('cities', []))}, {', '.join(job.get('countries', []))}\n"
            f"Work Type: {'Remote' if job.get('is_remote') else 'Hybrid' if job.get('is_hybride') else 'Onsite'}\n"
            f"Skills: {', '.join(job.get('required_skills', []))}\n"
            f"Description: {job.get('description')}"
        )
        
        clean_metadata = job.copy()
        
        # Convert any list values into strings
        for key, value in clean_metadata.items():
            if isinstance(value, list):
                clean_metadata[key] = ", ".join(map(str, value))
        
        # Keep the original data in metadata so you can retrieve it later
        doc = Document(page_content=content, metadata=clean_metadata)
        documents.append(doc)
    
    print(f"Storing documents")
    # 4. Create and persist the Vector Store
    vector_db = Chroma.from_documents(
        documents=documents,
        embedding=embeddings,
        persist_directory=persist_directory
    )
    print(f"Stored {len(jobs_data)} jobs in {persist_directory}")
    return vector_db


def get_vector_db(persist_directory="./job_chroma_db"):
    
    # 2. Load the existing database from the directory
    vector_db = Chroma(
        persist_directory=persist_directory, 
        embedding_function=embeddings
    )
    return vector_db


def search_top_jobs(
    query,
    vector_db,
    top_k=15,
    bm25_k=15
):
    if bm25_retriever is None:
        raise RuntimeError("BM25 retriever not initialized")
     
    # ---- Semantic search ----
    vector_results = vector_db.similarity_search(query, k=top_k)

    # ---- Keyword (BM25) search ----
    bm25_results = bm25_retriever.invoke(query)

    # ---- Merge & dedupe ----
    seen = set()
    combined = []

    for doc in vector_results + bm25_results:
        doc_id = doc.metadata.get("id") or doc.page_content
        if doc_id not in seen:
            seen.add(doc_id)
            combined.append(doc)

    return [doc.metadata for doc in combined[:top_k]]

# --- Usage Example ---
if __name__ == "__main__":
    # Path to your JSON file
    JSON_PATH = r"./jobs.json" 
    
    # Initialize vector store (do this once)
    vector_db = get_vector_db()
    
    # Initialize BM25 (do this once)
    init_bm25(vector_db)
    
    # Search function
    user_query = "Looking for a remote Python backend developer role"
    top_jobs = search_top_jobs(query=user_query , vector_db=vector_db)
    
    # Print results
    for i, job in enumerate(top_jobs, 1):
        print(f"{i}. {job.get('title')} - {job.get('company', 'N/A')}")