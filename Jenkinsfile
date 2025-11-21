pipeline {
    agent none

    environment {
        REPO_URL = "https://github.com/TAPASHRANJANNANDI/note-taking-app-MERN.git"
        BACKEND_IMAGE   = "tapashranjannandi/notes-app-backend:latest"
        FRONTEND_IMAGE  = "tapashranjannandi/notes-app-frontend:latest"
    }

    stages {

        /* ─────────────────────────────
           1. CHECKOUT + DETECT CHANGES
           ───────────────────────────── */
        stage('Checkout') {
            agent { label 'docker-slave' }
            steps {
                script {
                    git branch: 'main', url: REPO_URL

                    // Get changed files safely (first build tolerant)
                    changedFiles = sh(
                        script: "git diff --name-only HEAD~1 HEAD || true",
                        returnStdout: true
                    ).trim()

                    echo "Changed files:\n${changedFiles}"

                    // Detect first build (no diff)
                    boolean firstBuild = !changedFiles

                    // Determine what changed
                    BACKEND_CHANGED   = firstBuild || changedFiles.contains("backend/")
                    FRONTEND_CHANGED  = firstBuild || changedFiles.contains("frontend/")
                    K8_BACKEND_CHANGED = firstBuild || changedFiles.contains("kubernetes/backend/")
                    K8_FRONTEND_CHANGED = firstBuild || changedFiles.contains("kubernetes/frontend/")

                    echo """
                    Change Summary:
                    Backend changed   : ${BACKEND_CHANGED}
                    Frontend changed  : ${FRONTEND_CHANGED}
                    K8 Backend changed: ${K8_BACKEND_CHANGED}
                    K8 Frontend changed: ${K8_FRONTEND_CHANGED}
                    """
                }
            }
        }

        /* ─────────────────────────────
           2. BUILD DOCKER IMAGES
           ───────────────────────────── */
        stage('Build Docker Images') {
            agent { label 'docker-slave' }
            steps {
                script {

                    if (BACKEND_CHANGED) {
                        echo "Building backend image..."
                        sh """
                        cd backend
                        docker build -t notes-app-backend:latest .
                        """
                    } else {
                        echo "Skipping backend build"
                    }

                    if (FRONTEND_CHANGED) {
                        echo "Building frontend image..."
                        sh """
                        cd frontend
                        docker build -t notes-app-frontend:latest .
                        """
                    } else {
                        echo "Skipping frontend build"
                    }
                }
            }
        }

        /* ─────────────────────────────
           3. PUSH DOCKER IMAGES
           ───────────────────────────── */
        stage('Push Images to Docker Hub') {
            agent { label 'docker-slave' }
            steps {
                script {

                    if (BACKEND_CHANGED) {
                        sh """
                        docker tag notes-app-backend:latest ${BACKEND_IMAGE}
                        docker push ${BACKEND_IMAGE}
                        """
                    }

                    if (FRONTEND_CHANGED) {
                        sh """
                        docker tag notes-app-frontend:latest ${FRONTEND_IMAGE}
                        docker push ${FRONTEND_IMAGE}
                        """
                    }
                }
            }
        }

        /* ─────────────────────────────
           4. DEPLOY TO KUBERNETES
           ───────────────────────────── */
        stage('Deploy to Kubernetes') {
            agent { label 'kubernetes-node-slave' }
            steps {
                script {

                    // Backend Deployment
                    if (BACKEND_CHANGED || K8_BACKEND_CHANGED) {
                        echo "Deploying backend to Kubernetes..."
                        sh """
                        kubectl apply -f kubernetes/backend/deployment.yaml
                        kubectl apply -f kubernetes/backend/services.yaml
                        kubectl rollout restart deployment/nodejs-backend-deployment
                        """
                    } else {
                        echo "Skipping backend deployment"
                    }

                    // Frontend Deployment
                    if (FRONTEND_CHANGED || K8_FRONTEND_CHANGED) {
                        echo "Deploying frontend to Kubernetes..."
                        sh """
                        kubectl apply -f kubernetes/frontend/deployment.yaml
                        kubectl apply -f kubernetes/frontend/services.yaml
                        kubectl rollout restart deployment/react-frontend-app-deployment
                        """
                    } else {
                        echo "Skipping frontend deployment"
                    }
                }
            }
        }
    }

    /* ─────────────────────────────
       POST BUILD STATUS
       ───────────────────────────── */
    post {
        success {
            echo "Deployment completed successfully!"
        }
        failure {
            echo "Deployment failed!"
        }
    }
}
