/**
 * GLOBAL VARIABLES – accessible in all nodes
 */
def changedFiles = ""
def BACKEND_CHANGED = false
def FRONTEND_CHANGED = false
def K8_BACKEND_CHANGED = false
def K8_FRONTEND_CHANGED = false
def J_FILE_CHANGED = false
node('docker-slave') {

    stage('Check Changes') {
        changedFiles = sh(
            script: "git diff --name-only HEAD~1 HEAD || true",
            returnStdout: true
        ).trim()

        echo "Changed Files:\n${changedFiles}"

        // Set flags based on modified files
        BACKEND_CHANGED    = changedFiles.contains("backend/")
        FRONTEND_CHANGED   = changedFiles.contains("frontend/")
        K8_BACKEND_CHANGED = changedFiles.contains("kubernetes/backend/")
        K8_FRONTEND_CHANGED = changedFiles.contains("kubernetes/frontend/")
        J_FILE_CHANGED = changedFiles.contains("Jenkinsfile") // added jenkins file
        if (J_FILE_CHANGED) {
            echo "Jenkinsfile changed – deploying entire project!"
            BACKEND_CHANGED = true
            FRONTEND_CHANGED = true
            K8_BACKEND_CHANGED = true
            K8_FRONTEND_CHANGED = true
        }
    }

    stage('Git Clone') {
        git branch: 'main',
            url: 'https://github.com/TAPASHRANJANNANDI/note-taking-app-MERN.git'
    }

    stage('Build Images') {

        if (BACKEND_CHANGED) {
            echo "Building Backend Image..."
            sh """
                cd backend
                sudo docker build -t notes-app-backend:latest .
            """
        } else {
            echo "No backend changes – skipping backend build"
        }

        if (FRONTEND_CHANGED) {
            echo "Building Frontend Image..."
            sh """
                cd frontend
                sudo docker build -t notes-app-frontend:latest .
            """
        } else {
            echo "No frontend changes – skipping frontend build"
        }
    }

    stage('Push Images') {
          if (BACKEND_CHANGED || FRONTEND_CHANGED) {
        withCredentials([usernamePassword(credentialsId: 'dockerhub-creds',
                                         usernameVariable: 'DOCKER_USER',
                                         passwordVariable: 'DOCKER_PASS')]) {

            sh """
                echo "$DOCKER_PASS" | sudo docker login -u "$DOCKER_USER" --password-stdin
            """
        }
          }
        if (BACKEND_CHANGED) {
           
            sh """
                sudo docker  tag notes-app-backend:latest tapashranjannandi/notes-app-backend:latest
               
            """
             withCredentials([usernamePassword(credentialsId: 'dockerhub-creds',
                                         usernameVariable: 'DOCKER_USER',
                                         passwordVariable: 'DOCKER_PASS')]) {

            sh """
                echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                sudo docker  push tapashranjannandi/notes-app-backend:latest
            """
            }
        }

        if (FRONTEND_CHANGED) {
            
            sh """
                sudo docker  tag notes-app-frontend:latest tapashranjannandi/notes-app-frontend:latest

                
            """
            withCredentials([usernamePassword(credentialsId: 'dockerhub-creds',
                                         usernameVariable: 'DOCKER_USER',
                                         passwordVariable: 'DOCKER_PASS')]) {

            sh """
                echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                sudo docker  push tapashranjannandi/notes-app-frontend:latest
            """
            }
        }

        if (!BACKEND_CHANGED && !FRONTEND_CHANGED) {
            echo "No image changes – skipping docker push"
        }
    }
}

node('kubernetes-node-slave') {

    stage('Deploy to Kubernetes') {

        boolean ANY_CHANGE = BACKEND_CHANGED || FRONTEND_CHANGED || K8_BACKEND_CHANGED || K8_FRONTEND_CHANGED

        if (!ANY_CHANGE) {
            echo "No application or Kubernetes changes – skipping deployment"
            return
        }

        if (BACKEND_CHANGED || K8_BACKEND_CHANGED) {
            echo "Deploying Backend..."
            sh """
                kubectl apply -f kubernetes/backend/deployment.yaml
                kubectl apply -f kubernetes/backend/services.yaml
                kubectl rollout restart deployment/nodejs-backend-deployment || true
            """ 
        } else {
            echo "Backend – no changes"
        }

        if (FRONTEND_CHANGED || K8_FRONTEND_CHANGED) {
            echo "Deploying Frontend..."
            sh """
                kubectl apply -f kubernetes/frontend/deployment.yaml
                kubectl apply -f kubernetes/frontend/services.yaml
                kubectl rollout restart deployment/react-frontend-app-deployment || true
            """
        } else {
            echo "Frontend – no changes"
        }
    }
}
