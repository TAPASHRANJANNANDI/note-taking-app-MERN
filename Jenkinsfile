node('docker-slave') {
    def changedFiles = sh(
        script: "git diff --name-only HEAD~1 HEAD || true", //check the commit
        returnStdout: true
    ).trim()
    echo "Changed files:\n${changedFiles}"
    def BACKEND_CHANGED = changedFiles.contains("backend/")
    def FRONTEND_CHANGED = changedFiles.contains("frontend/")
    def KUBERNETES_BACKEND_CHANGED = changedFiles.contains("kubernetes/backend/")
    def KUBERNETES_FRONTEND_CHANGED = changedFiles.contains("kubernetes/frontend/")
    def stages = ['git-clone','build', 'push']
    for (i in stages) {
        stage(i) {
            if (i == 'git-clone') {
                git branch: 'main',
                    url: 'https://github.com/TAPASHRANJANNANDI/note-taking-app-MERN.git'
            }
            if (i == 'build') {
                if (BACKEND_CHANGED) {
                    echo "Backend changed – building backend Docker image"
                    sh """
                    cd backend
                    docker build -t notes-app-backend:latest .
                    """
                } else {
                    echo "Backend NOT changed – skipping backend build"
                }
                if (FRONTEND_CHANGED) {
                    echo "Frontend changed – building frontend Docker image"
                    sh """
                    cd frontend
                    docker build -t notes-app-frontend:latest .
                    """
                } else {
                    echo "Frontend NOT changed – skipping frontend build"
                }
            }
            if (i == 'push') {

                if (BACKEND_CHANGED) {
                    sh """
                    docker tag notes-app-backend:latest tapashranjannandi/notes-app-backend:latest
                    docker push tapashranjannandi/notes-app-backend:latest
                    """
                }

                if (FRONTEND_CHANGED) {
                    sh """
                    docker tag notes-app-frontend:latest tapashranjannandi/notes-app-frontend:latest
                    docker push tapashranjannandi/notes-app-frontend:latest
                    """
                }
            }
        }
    }
}
node ('kubernetes-slave') {
    if (BACKEND_CHANGED) {
        echo "Deploying backend Kubernetes resources"
        sh """
        kubectl rollout restart deployment/nodejs-backend-deployment
        kubectl apply -f kubernetes/backend/deployment.yaml
        kubectl apply -f kubernetes/backend/services.yaml
        """
    } else {
        echo "Skipping backend deploy"
    }
    if (FRONTEND_CHANGED) {
        echo "Deploying frontend Kubernetes resources"
        sh """
        kubectl rollout restart deployment/react-frontend-app-deployment
        kubectl apply -f kubernetes/frontend/deployment.yaml
        kubectl apply -f kubernetes/frontend/services.yaml
        """
    } else {
        echo "Skipping frontend deploy"
    }
    if (KUBERNETES_BACKEND_CHANGED) {
        echo "Kubernetes backend config changed – applying changes"
        sh """
        kubectl apply -f kubernetes/backend/deployment.yaml
        kubectl apply -f kubernetes/backend/services.yaml
        """
    } else {
        echo "Kubernetes backend config NOT changed – skipping"
    }
    if (KUBERNETES_FRONTEND_CHANGED) {
        echo "Kubernetes frontend config changed – applying changes"
        sh """
        kubectl apply -f kubernetes/frontend/deployment.yaml
        kubectl apply -f kubernetes/frontend/services.yaml
        """
    } else {
        echo "Kubernetes frontend config NOT changed – skipping"
    }
}