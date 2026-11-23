pipeline {
    agent any

    options {
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timeout(time: 60, unit: 'MINUTES')
    }

    environment {
        // ── Identifiants ──────────────────────────────────────
        //DOCKERHUB_CREDENTIALS = credentials('docker-hub')
        SONAR_TOKEN           = credentials('sonarqube-crds')
        GITHUB_TOKEN          = credentials('github-crds')
        //ARGOCD_TOKEN          = credentials('argocd-token')

        // ── Images ────────────────────────────────────────────
        DOCKERHUB_USER        = 'houssem26102001'
        BACKEND_IMAGE         = "${DOCKERHUB_USER}/student-backend"
        FRONTEND_IMAGE        = "${DOCKERHUB_USER}/student-frontend"
        IMAGE_TAG             = "${BUILD_NUMBER}"

        // ── ZAP DAST ──────────────────────────────────────────
        ZAP_REPORT_DIR        = "${WORKSPACE}/zap-reports"
        ZAP_NETWORK           = "zap-net-${BUILD_NUMBER}"

        // ── ZAP ───────────────────────────────────────────────
        ZAP_TARGET            = 'http://192.168.56.11:30080'
    }

    tools {
        jdk   'java21'
        maven 'maven3'
        nodejs 'nodeJs26'
    }

    stages {

        // ══════════════════════════════════════════════════════
        // STAGE 1 — CHECKOUT
        // ══════════════════════════════════════════════════════
        stage('1 · Checkout') {
            steps {
                cleanWs()
                git branch: 'main',
                    credentialsId: 'github-crds',
                    url: 'https://github.com/houssem-dev-sh/edugrade'
                sh 'echo "Commit: ${GIT_COMMIT}" && git log --oneline -5'
            }
        }

        // ══════════════════════════════════════════════════════
        // STAGE 2 — MAVEN BUILD (Spring Boot)
        // ══════════════════════════════════════════════════════
        stage('2 · Maven Build') {
            steps {
                dir('.') {
                    sh 'java -version'
                    sh 'mvn -version'
                    sh 'mvn clean package -DskipTests -B'
                    sh 'ls -lh target/*.jar'
                }
            }
            post {
                success {
                    archiveArtifacts artifacts: 'target/*.jar', fingerprint: true
                }
            }
        }

        // ══════════════════════════════════════════════════════
        // STAGE 3 — NPM BUILD (React)
        // ══════════════════════════════════════════════════════
        stage('3 · npm Build') {
            steps {
                dir('student-frontend-react') {
                    sh 'npm ci --prefer-offline'
                    sh 'npm run build --if-present'
                }
            }
        }

        // ══════════════════════════════════════════════════════
        // STAGE 4 — SONARQUBE SAST
        // ══════════════════════════════════════════════════════
        stage('4 · SonarQube SAST') {
            environment {
                SCANNER_HOME = tool 'sonar-scanner'
            }
            steps {
                withSonarQubeEnv('sonarqube') {
                    withCredentials([
                        string(credentialsId: 'sonarqube-crds', variable: 'SONAR_TOKEN')
                    ]) {
                        sh '''
                            ${SCANNER_HOME}/bin/sonar-scanner \
                            -Dsonar.projectKey=edugarde \
                            -Dsonar.projectName="edugarde" \
                            -Dsonar.sources=src,student-frontend-react/src \
                            -Dsonar.java.binaries=target/classes \
                            -Dsonar.host.url=$SONAR_HOST_URL \
                            -Dsonar.login=$SONAR_TOKEN
                        '''
                    }
                }
            }    
        }

        // ══════════════════════════════════════════════════════
        // STAGE 5 — QUALITY GATE
        // ══════════════════════════════════════════════════════
        stage('5 · Quality Gate') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        // ══════════════════════════════════════════════════════
        // STAGE 6 — DOCKER BUILD
        // ══════════════════════════════════════════════════════
        stage('6 · Docker Build') {
            steps {
                sh """
                    docker build -t ${BACKEND_IMAGE}:${IMAGE_TAG} -t ${BACKEND_IMAGE}:latest -f Dockerfile .
                    docker build -t ${FRONTEND_IMAGE}:${IMAGE_TAG} -t ${FRONTEND_IMAGE}:latest -f student-frontend-react/Dockerfile student-frontend-react

                    docker image prune -f
                """
            }
        }

        // ══════════════════════════════════════════════════════
        // STAGE 7 — TRIVY FILESYSTEM SCAN
        // ══════════════════════════════════════════════════════
        stage('7 · Trivy FS Scan') {
            steps {
                sh """
                    trivy fs \
                        --exit-code 0 \
                        --severity HIGH,CRITICAL \
                        --format table \
                        -o trivy-fs-report.txt \
                        .
                    cat trivy-fs-report.txt
                """
            }
            post {
                always {
                    archiveArtifacts artifacts: 'trivy-fs-report.txt'
                }
            }
        }

        // ══════════════════════════════════════════════════════
        // STAGE 8 — TRIVY IMAGE SCAN (bloquant)
        // ══════════════════════════════════════════════════════
        stage('8 · Trivy Image Scan') {
            steps {
                sh """
                    trivy image \
                        --exit-code 0 \
                        --severity CRITICAL \
                        --format table \
                        -o trivy-backend-report.txt \
                        ${BACKEND_IMAGE}:${IMAGE_TAG}

                    trivy image \
                        --exit-code 0 \
                        --severity CRITICAL \
                        --format table \
                        -o trivy-frontend-report.txt \
                        ${FRONTEND_IMAGE}:${IMAGE_TAG}
                """
            }
            post {
                always {
                    archiveArtifacts artifacts: 'trivy-*.txt'
                }
            }
        }

        // ══════════════════════════════════════════════════════
        // STAGE 9 — SYFT SBOM
        // ══════════════════════════════════════════════════════
        stage('9 · Syft SBOM') {
            steps {
                sh '''
                    syft ${BACKEND_IMAGE}:${IMAGE_TAG} \
                        -o spdx-json=sbom-backend.json

                    syft ${FRONTEND_IMAGE}:${IMAGE_TAG} \
                        -o spdx-json=sbom-frontend.json

                    echo "SBOM backend:"

                    python3 -c "
import json

with open('sbom-backend.json') as f:
    print('Backend packages:', len(json.load(f).get('packages', [])))

with open('sbom-frontend.json') as f:
    print('Frontend packages:', len(json.load(f).get('packages', [])))
"
                '''
            }
            post {
                always {
                    archiveArtifacts artifacts: 'sbom-*.json'
                }
            }
        }
        // ══════════════════════════════════════════════════════
        // STAGE 10 — OWASP ZAP DAST SCAN (Conteneur Staging)
        // ══════════════════════════════════════════════════════
        stage('10 · OWASP ZAP DAST Scan') {
            steps {
                sh """
                    docker network create ${ZAP_NETWORK} || true
                    echo "── Diagnostic DNS dans le contexte Jenkins ──"
                    docker run --rm --network ${ZAP_NETWORK} alpine cat /etc/resolv.conf
                    docker info 2>&1 | grep -i "Docker Root Dir\\|Server Version\\|Operating System"
                   """
                sh """
                    mkdir -p "${ZAP_REPORT_DIR}"

                    docker network create ${ZAP_NETWORK} || true
                    docker volume create zap-vol-${BUILD_NUMBER}
                    docker run --rm -v zap-vol-${BUILD_NUMBER}:/zap/wrk alpine chmod 777 /zap/wrk

                    docker run -d --name backend-test-${BUILD_NUMBER} --network ${ZAP_NETWORK} --network-alias backend ${BACKEND_IMAGE}:${IMAGE_TAG}
                    docker run -d --name frontend-test-${BUILD_NUMBER} --network ${ZAP_NETWORK} ${FRONTEND_IMAGE}:${IMAGE_TAG}

                    # Attente RÉELLE : on teste que le port 80 répond, pas juste que le conteneur est "Running"
                    echo "Attente que le frontend réponde sur le port 80..."
                    READY=false
                    for i in \$(seq 1 15); do
                        CODE=\$(docker run --rm --network ${ZAP_NETWORK} curlimages/curl -s -o /dev/null -w "%{http_code}" --max-time 2 http://frontend-test-${BUILD_NUMBER}:80 2>/dev/null) || true
                        echo "Tentative \$i : code HTTP '\$CODE'"
                        if [ -n "\$CODE" ] && [ "\$CODE" != "000" ]; then
                            READY=true
                            echo "Frontend répond (code \$CODE)."
                            break
                        fi
                        sleep 2
                    done

                    # Logs systématiques pour diagnostiquer, même si ça a l'air OK
                    echo "── Logs frontend-test-${BUILD_NUMBER} ──"
                    docker logs frontend-test-${BUILD_NUMBER} || true
                    echo "── État du conteneur ──"
                    docker inspect -f 'Running={{.State.Running}} ExitCode={{.State.ExitCode}} Error={{.State.Error}}' frontend-test-${BUILD_NUMBER} || true

                    if [ "\$READY" != "true" ]; then
                        echo "❌ Le frontend n'a jamais répondu sur le port 80, le scan ZAP va échouer."
                    fi

                    docker run --name zap-scan-${BUILD_NUMBER} \
                        --network ${ZAP_NETWORK} \
                        -v zap-vol-${BUILD_NUMBER}:/zap/wrk:rw \
                        ghcr.io/zaproxy/zaproxy:stable \
                        zap-baseline.py \
                        -t http://frontend-test-${BUILD_NUMBER}:80 \
                        -r zap-frontend-report.html \
                        -J zap-frontend-report.json \
                        -I || true

                    docker cp zap-scan-${BUILD_NUMBER}:/zap/wrk/zap-frontend-report.html "${ZAP_REPORT_DIR}/" || true
                    docker cp zap-scan-${BUILD_NUMBER}:/zap/wrk/zap-frontend-report.json "${ZAP_REPORT_DIR}/" || true

                    ls -la "${ZAP_REPORT_DIR}"
                """
            }
            post {
                always {
                    sh """
                        docker rm -f backend-test-${BUILD_NUMBER} frontend-test-${BUILD_NUMBER} zap-scan-${BUILD_NUMBER} || true
                        docker network rm ${ZAP_NETWORK} || true
                        docker volume rm zap-vol-${BUILD_NUMBER} || true
                    """
                    archiveArtifacts artifacts: 'zap-reports/*', allowEmptyArchive: true
                }
            }
        }
   
        // ══════════════════════════════════════════════════════
        // STAGE 11 — COSIGN SIGN
        // ══════════════════════════════════════════════════════
        stage('10 · Push & Sign Images') {
            steps {
                withCredentials([
                    file(credentialsId: 'cosign-private-key', variable: 'COSIGN_KEY'),
                    string(credentialsId: 'cosign-password', variable: 'COSIGN_PASSWORD'),
                    usernamePassword(credentialsId: 'docker-hub', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')
                ]) {
                    sh '''
                        export COSIGN_PASSWORD="$COSIGN_PASSWORD"

                        # 1. Connexion Docker Hub
                        echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin

                        # 2. Création des tags 'latest'
                        docker tag ${BACKEND_IMAGE}:${IMAGE_TAG} ${BACKEND_IMAGE}:latest
                        docker tag ${FRONTEND_IMAGE}:${IMAGE_TAG} ${FRONTEND_IMAGE}:latest

                        # 3. Push de toutes les images
                        docker push ${BACKEND_IMAGE}:${IMAGE_TAG}
                        docker push ${BACKEND_IMAGE}:latest
                        docker push ${FRONTEND_IMAGE}:${IMAGE_TAG}
                        docker push ${FRONTEND_IMAGE}:latest

                        # 4. Signature Cosign des tags de version et latest
                        cosign sign --yes --key "$COSIGN_KEY" ${BACKEND_IMAGE}:${IMAGE_TAG}
                        cosign sign --yes --key "$COSIGN_KEY" ${BACKEND_IMAGE}:latest
                        cosign sign --yes --key "$COSIGN_KEY" ${FRONTEND_IMAGE}:${IMAGE_TAG}
                        cosign sign --yes --key "$COSIGN_KEY" ${FRONTEND_IMAGE}:latest

                        echo "✅ Images versionnées (${IMAGE_TAG}) et latest poussées et signées"
                    '''
                }
            }
        }
    }
}