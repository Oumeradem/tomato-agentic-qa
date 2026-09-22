pipeline {
    agent any

    environment {
        // Credentials come from Jenkins credentials store, never the repo.
        ENV = 'qa'
        HEADLESS = 'true'
        CI = 'true'
        // Optional: inject secrets via Jenkins credentials
        // USERNAME = credentials('username')
        // PASSWORD = credentials('password')
    }

    stages {
        stage('Install') {
            steps {
                sh 'npm ci'
                sh 'npx playwright install --with-deps chromium'
            }
        }

        stage('Static Checks') {
            steps {
                sh 'npm run typecheck'
                sh 'npm run lint'
                sh 'npm run format:check'
            }
        }

        stage('Start Demo App') {
            steps {
                sh '''
                    npm run demo > /tmp/demo.log 2>&1 &
                    for i in $(seq 1 30); do
                        curl -s http://localhost:3100 > /dev/null && break
                        sleep 1
                    done
                '''
            }
        }

        stage('Execute Tests') {
            steps {
                // Run smoke suite by default; switch tag via parameter if needed.
                sh 'npm run test:smoke'
            }
        }

        stage('Generate Reports') {
            steps {
                sh 'npx allure generate reports/allure-results --clean -o reports/allure-report || true'
            }
        }
    }

    post {
        always {
            archiveArtifacts artifacts: 'reports/**', fingerprint: true, allowEmptyArchive: true
            archiveArtifacts artifacts: 'screenshots/**, traces/**', allowEmptyArchive: true
            junit testResults: 'reports/**/*.xml', allowEmptyResults: true, keepLongStdio: true
            // Always publish reports even when tests fail.
            publishHTML([
                allowMissing: true,
                alwaysLinkToLastBuild: true,
                keepAll: true,
                reportDir: 'reports/cucumber-report',
                reportFiles: 'cucumber-report.html',
                reportName: 'Cucumber Report'
            ])
            cleanWs()
        }
        failure {
            echo 'Tests failed. See reports and failure artifacts above.'
        }
    }
}
