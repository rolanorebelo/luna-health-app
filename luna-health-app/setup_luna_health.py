#!/usr/bin/env python3
"""
Luna Health AI - Automated Setup Script
Complete setup automation for the enhanced medical image analysis system
"""

import os
import sys
import subprocess
import json
import urllib.request
from pathlib import Path
import shutil
import logging
from typing import Dict, List, Optional
import argparse

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class LunaHealthSetup:
    """Automated setup for Luna Health AI system"""
    
    def __init__(self, project_dir: str = "."):
        self.project_dir = Path(project_dir).resolve()
        self.backend_dir = self.project_dir / "luna-health-app" / "backend"
        self.venv_dir = self.backend_dir / "venv"
        self.models_dir = self.backend_dir / "models"
        self.data_dir = self.backend_dir / "data"
        
        # System requirements
        self.python_min_version = (3, 8)
        self.required_packages = [
            "fastapi", "uvicorn", "python-multipart", "pillow", "numpy",
            "torch", "torchvision", "transformers", "openai", "opencv-python",
            "scikit-learn", "matplotlib", "seaborn", "pytest", "pytest-asyncio",
            "httpx", "langchain", "chromadb", "python-dotenv", "pydantic", "aiofiles"
        ]
        
        # Sample data URLs (placeholder - replace with actual medical dataset URLs)
        self.sample_data_urls = {
            "skin_samples": "https://example.com/skin_samples.zip",  # Placeholder
            "discharge_samples": "https://example.com/discharge_samples.zip"  # Placeholder
        }
        
    def check_python_version(self) -> bool:
        """Check if Python version meets requirements"""
        current_version = sys.version_info[:2]
        if current_version < self.python_min_version:
            logger.error(f"Python {self.python_min_version[0]}.{self.python_min_version[1]}+ required. "
                        f"Current version: {current_version[0]}.{current_version[1]}")
            return False
        
        logger.info(f"✅ Python version: {current_version[0]}.{current_version[1]} (OK)")
        return True
    
    def check_system_dependencies(self) -> bool:
        """Check system-level dependencies"""
        dependencies = {
            "git": "git --version",
            "pip": "pip --version"
        }
        
        missing_deps = []
        for dep, command in dependencies.items():
            try:
                subprocess.run(command.split(), check=True, capture_output=True)
                logger.info(f"✅ {dep} is available")
            except (subprocess.CalledProcessError, FileNotFoundError):
                missing_deps.append(dep)
                logger.error(f"❌ {dep} is not available")
        
        if missing_deps:
            logger.error(f"Missing system dependencies: {', '.join(missing_deps)}")
            return False
        
        return True
    
    def create_directory_structure(self):
        """Create required directory structure"""
        directories = [
            self.models_dir,
            self.data_dir / "images" / "skin",
            self.data_dir / "images" / "discharge", 
            self.data_dir / "annotations",
            self.backend_dir / "training",
            self.backend_dir / "tests"
        ]
        
        for directory in directories:
            directory.mkdir(parents=True, exist_ok=True)
            logger.info(f"📁 Created directory: {directory}")
    
    def create_virtual_environment(self):
        """Create Python virtual environment"""
        if self.venv_dir.exists():
            logger.info("🔄 Virtual environment exists, skipping creation")
            return
        
        logger.info("🐍 Creating Python virtual environment...")
        try:
            subprocess.run([
                sys.executable, "-m", "venv", str(self.venv_dir)
            ], check=True)
            logger.info(f"✅ Virtual environment created: {self.venv_dir}")
        except subprocess.CalledProcessError as e:
            logger.error(f"❌ Failed to create virtual environment: {e}")
            raise
    
    def get_venv_python(self) -> str:
        """Get path to virtual environment Python"""
        if os.name == 'nt':  # Windows
            return str(self.venv_dir / "Scripts" / "python.exe")
        else:  # Unix/Linux/macOS
            return str(self.venv_dir / "bin" / "python")
    
    def get_venv_pip(self) -> str:
        """Get path to virtual environment pip"""
        if os.name == 'nt':  # Windows
            return str(self.venv_dir / "Scripts" / "pip.exe")
        else:  # Unix/Linux/macOS
            return str(self.venv_dir / "bin" / "pip")
    
    def install_python_packages(self):
        """Install required Python packages"""
        logger.info("📦 Installing Python packages...")
        
        # Upgrade pip first
        subprocess.run([
            self.get_venv_pip(), "install", "--upgrade", "pip"
        ], check=True)
        
        # Install requirements from file if exists
        requirements_file = self.backend_dir / "requirements.txt"
        if requirements_file.exists():
            logger.info(f"📋 Installing from {requirements_file}")
            try:
                subprocess.run([
                    self.get_venv_pip(), "install", "-r", str(requirements_file)
                ], check=True)
                logger.info("✅ All packages installed successfully")
            except subprocess.CalledProcessError as e:
                logger.warning(f"⚠️ Some packages failed to install: {e}")
                logger.info("🔄 Trying individual package installation...")
                self.install_packages_individually()
        else:
            logger.info("📋 Installing packages individually...")
            self.install_packages_individually()
    
    def install_packages_individually(self):
        """Install packages one by one for better error handling"""
        failed_packages = []
        
        for package in self.required_packages:
            try:
                logger.info(f"📦 Installing {package}...")
                subprocess.run([
                    self.get_venv_pip(), "install", package
                ], check=True, capture_output=True)
                logger.info(f"✅ {package} installed")
            except subprocess.CalledProcessError as e:
                logger.warning(f"⚠️ Failed to install {package}: {e}")
                failed_packages.append(package)
        
        if failed_packages:
            logger.warning(f"Failed to install: {', '.join(failed_packages)}")
            logger.info("You may need to install these manually or check your internet connection")
    
    def create_environment_file(self):
        """Create .env file with configuration"""
        env_file = self.backend_dir / ".env"
        
        if env_file.exists():
            logger.info("🔧 .env file already exists, skipping creation")
            return
        
        env_content = """# Luna Health AI Configuration
# OpenAI API Key (required for GPT-4 Vision)
OPENAI_API_KEY=your_openai_api_key_here

# App Settings
APP_NAME=Luna Health AI
API_V1_STR=/api/v1

# CORS Origins (comma-separated)
BACKEND_CORS_ORIGINS=http://localhost:3000,http://localhost:3001

# File Upload Settings
MAX_UPLOAD_SIZE=10485760  # 10MB in bytes
ALLOWED_EXTENSIONS=.jpg,.jpeg,.png,.webp

# Model Configuration
MODELS_DIR=models
RESNET_MODEL_PATH=models/medical_resnet_best.pth
OPENAI_MODEL=gpt-4-vision-preview

# Image Processing
IMAGE_SIZE=224,224
MIN_IMAGE_SIZE=100,100
MAX_IMAGE_DIMENSION=2048
BLUR_THRESHOLD=100.0
QUALITY_THRESHOLD=0.7

# Training Configuration
BATCH_SIZE=32
LEARNING_RATE=0.001
NUM_EPOCHS=50
VALIDATION_SPLIT=0.2
"""
        
        with open(env_file, 'w') as f:
            f.write(env_content)
        
        logger.info(f"✅ Created .env file: {env_file}")
        logger.warning("⚠️ Remember to update OPENAI_API_KEY in .env file!")
    
    def create_sample_annotations(self):
        """Create sample annotation files for development"""
        annotations_dir = self.data_dir / "annotations"
        
        # Sample annotations for development/testing
        sample_annotations = [
            {
                "filename": "sample_skin_normal.jpg",
                "class": "normal_skin",
                "category": "skin",
                "quality_score": 0.9,
                "width": 512,
                "height": 512,
                "file_size": 102400
            },
            {
                "filename": "sample_discharge_normal.jpg", 
                "class": "normal_white",
                "category": "discharge",
                "quality_score": 0.8,
                "width": 400,
                "height": 400,
                "file_size": 81920
            }
        ]
        
        # Create main annotations file
        annotations_file = annotations_dir / "annotations.json"
        with open(annotations_file, 'w') as f:
            json.dump(sample_annotations, f, indent=2)
        
        logger.info(f"✅ Created sample annotations: {annotations_file}")
        
        # Create split files
        for split_name in ['train', 'validation', 'test']:
            split_file = annotations_dir / f"{split_name}_annotations.json"
            with open(split_file, 'w') as f:
                json.dump(sample_annotations, f, indent=2)
            logger.info(f"✅ Created {split_name} annotations: {split_file}")
    
    def create_gitignore(self):
        """Create .gitignore file"""
        gitignore_file = self.project_dir / ".gitignore"
        
        gitignore_content = """# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
*.egg-info/
.installed.cfg
*.egg
MANIFEST

# Virtual Environment
venv/
env/
ENV/

# Environment Variables
.env
.env.local
.env.development
.env.test
.env.production

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# Models and Data
models/*.pth
models/*.pt
models/*.pkl
data/images/
!data/images/.gitkeep
data/raw/
logs/
checkpoints/

# Testing
.pytest_cache/
.coverage
htmlcov/

# OS
.DS_Store
Thumbs.db

# Node.js (for frontend)
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Build artifacts
*.log
"""
        
        with open(gitignore_file, 'w') as f:
            f.write(gitignore_content)
        
        logger.info(f"✅ Created .gitignore: {gitignore_file}")
    
    def create_placeholder_files(self):
        """Create placeholder files to maintain directory structure"""
        placeholder_dirs = [
            self.data_dir / "images" / "skin",
            self.data_dir / "images" / "discharge"
        ]
        
        for directory in placeholder_dirs:
            placeholder_file = directory / ".gitkeep"
            with open(placeholder_file, 'w') as f:
                f.write("# Placeholder file to maintain directory structure\n")
            logger.info(f"📝 Created placeholder: {placeholder_file}")
    
    def run_tests(self):
        """Run test suite to verify installation"""
        logger.info("🧪 Running test suite...")
        
        test_file = self.backend_dir / "tests" / "test_vision_analysis.py"
        if not test_file.exists():
            logger.warning("⚠️ Test file not found, skipping tests")
            return
        
        try:
            # Change to backend directory
            original_cwd = os.getcwd()
            os.chdir(self.backend_dir)
            
            # Run tests
            result = subprocess.run([
                self.get_venv_python(), "-m", "pytest", 
                str(test_file), "-v", "--tb=short"
            ], capture_output=True, text=True)
            
            if result.returncode == 0:
                logger.info("✅ All tests passed!")
            else:
                logger.warning("⚠️ Some tests failed:")
                logger.info(result.stdout)
                logger.warning(result.stderr)
            
        except subprocess.CalledProcessError as e:
            logger.warning(f"⚠️ Test execution failed: {e}")
        finally:
            os.chdir(original_cwd)
    
    def create_startup_scripts(self):
        """Create scripts to start the application"""
        
        # Development startup script
        if os.name == 'nt':  # Windows
            script_content = f"""@echo off
cd /d "{self.backend_dir}"
"{self.get_venv_python()}" -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
pause
"""
            script_file = self.backend_dir / "start_dev.bat"
        else:  # Unix/Linux/macOS
            script_content = f"""#!/bin/bash
cd "{self.backend_dir}"
source venv/bin/activate
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
"""
            script_file = self.backend_dir / "start_dev.sh"
            
        with open(script_file, 'w') as f:
            f.write(script_content)
        
        if os.name != 'nt':
            os.chmod(script_file, 0o755)  # Make executable
        
        logger.info(f"✅ Created startup script: {script_file}")
    
    def print_next_steps(self):
        """Print next steps for the user"""
        logger.info("\n" + "="*60)
        logger.info("🎉 Luna Health AI Setup Complete!")
        logger.info("="*60)
        logger.info("\n📋 Next Steps:")
        logger.info("1. Update your OpenAI API key in .env file:")
        logger.info(f"   {self.backend_dir}/.env")
        logger.info("\n2. Add training images to:")
        logger.info(f"   {self.data_dir}/images/skin/")
        logger.info(f"   {self.data_dir}/images/discharge/")
        logger.info("\n3. Train the ResNet model:")
        logger.info(f"   cd {self.backend_dir}")
        logger.info("   source venv/bin/activate  # On Windows: venv\\Scripts\\activate")
        logger.info("   python training/train_medical_resnet.py")
        logger.info("\n4. Start the development server:")
        if os.name == 'nt':
            logger.info(f"   {self.backend_dir}\\start_dev.bat")
        else:
            logger.info(f"   {self.backend_dir}/start_dev.sh")
        logger.info("\n5. Access the API at: http://localhost:8000")
        logger.info("   API documentation: http://localhost:8000/docs")
        logger.info("\n📚 Documentation and examples can be found in the README.md")
        logger.info("⚠️  Remember to set up proper medical datasets for training!")
    
    def setup(self, skip_tests=False, skip_venv=False):
        """Run complete setup process"""
        logger.info("🚀 Starting Luna Health AI setup...")
        
        # Pre-flight checks
        if not self.check_python_version():
            return False
        
        if not self.check_system_dependencies():
            return False
        
        try:
            # Setup steps
            self.create_directory_structure()
            
            if not skip_venv:
                self.create_virtual_environment()
                self.install_python_packages()
            
            self.create_environment_file()
            self.create_sample_annotations()
            self.create_gitignore()
            self.create_placeholder_files()
            self.create_startup_scripts()
            
            if not skip_tests and not skip_venv:
                self.run_tests()
            
            self.print_next_steps()
            return True
            
        except Exception as e:
            logger.error(f"❌ Setup failed: {e}")
            return False

def main():
    parser = argparse.ArgumentParser(description='Luna Health AI Setup Script')
    parser.add_argument('--project-dir', type=str, default='.',
                        help='Project directory path')
    parser.add_argument('--skip-tests', action='store_true',
                        help='Skip running tests')
    parser.add_argument('--skip-venv', action='store_true',
                        help='Skip virtual environment setup and package installation')
    
    args = parser.parse_args()
    
    setup = LunaHealthSetup(args.project_dir)
    success = setup.setup(skip_tests=args.skip_tests, skip_venv=args.skip_venv)
    
    if success:
        logger.info("✅ Setup completed successfully!")
        sys.exit(0)
    else:
        logger.error("❌ Setup failed!")
        sys.exit(1)

if __name__ == "__main__":
    main()