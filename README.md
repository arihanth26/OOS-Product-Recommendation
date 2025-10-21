# Out-of-Stock Product Recommendation Engine
When an item is out of stock (OOS), the order is at risk. We aim to recommend very similar substitutes that shoppers accept while preserving basket value, and to flag SKUs with weak substitute coverage for planners.

## Setup

### 1. Prerequisites

Make sure you have the following installed:

- **Python 3.11+**
- **pip** 
- **git** 

Check your Python version:
```bash
python --version
```

### 2. Clone the repo 

```bash
git clone https://github.gatech.edu/Group44-OOS-Recommendation/OOS-Product-Recommendation-Engine.git
cd OOS-Product-Recommendation-Engine
```

### 3. Create and Activate the environment 

Create a new virtual environment inside the project folder:

```bash
py -3.11 -m venv .venv  
```
### 4. Activate the environment

#### macOS/Linux:

```bash
source .venv/bin/activate
```

#### Windows (PowerShell):

Update PowerShell’s execution policy to allow running scripts - This may be needed to run the following line.
```bash
 Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

```bash
.venv\Scripts\Activate.ps1
```

You’ll see (.venv) appear in your terminal prompt, confirming activation.


### 5. Install Dependencies

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

Optional: freeze exact versions for reproducibility:

```bash
pip freeze > requirements-lock.txt
```

### 6. Verify Installation

```bash
python -c "import numpy, pandas, sklearn" 
```

## Usage
How to run training, notebooks, or Streamlit app.

## Results
One figure or short description of outcomes.

## Docs
See [docs/](docs/) for full proposal, midterm, and final reports.