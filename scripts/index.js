class Main {
    constructor() {
        this.intro = document.getElementById('intro');
        this.consentForm = document.getElementById('consent-form');
        this.webcamSection = document.getElementById('webcam-section');
        this.videoElement = document.getElementById('webcam');
        this.stream = null;
        this._parentWillTakeControl = false;
        this.loadModels();

        this.initializeEventListeners();
        this.setupPostMessageListeners();
    }

    async initializeEventListeners() {
        if (this.consentForm) {
            this.consentForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const consentCheckbox = document.getElementById('biometric-consent');
                if (consentCheckbox.checked) {
                    this.requestWebcamAccess();
                }
            });
        }

        // Add try again button listener
        const tryAgainBtn = document.querySelector('.try-again-btn');
        if (tryAgainBtn) {
            tryAgainBtn.addEventListener('click', () => {
                document.getElementById('results-section').style.display = 'none';
                this.requestWebcamAccess();
            });
        }
    }

    setupPostMessageListeners() {
        if(window.opener) {
            window.addEventListener('message', (event) => {
                if(event.data.type === 'confirm-parent-commandeer') {
                    this._nonce = event.data.nonce;
                    this._parentWillTakeControl = true;
                }
            });
            window.opener.postMessage({ type: 'check-parent-commandeer' }, '*');
        }
    }

    async loadModels() {
        try {
            this.promises = Promise.all([
                faceapi.nets.tinyFaceDetector.loadFromUri('./models'),
                faceapi.nets.ageGenderNet.loadFromUri('./models'),
                faceapi.nets.faceLandmark68Net.loadFromUri('./models')
            ]).catch(() => {
                console.error('Error loading models');
                this.promises = null;
            });
        } catch (error) {
            console.error('Error loading models');
            this.promises = null;
        }
    }

    displayModelError() {
        if(this._parentWillTakeControl) {
            window.opener.postMessage({ type: 'age-estimation-error', error: 'Error loading models', nonce: this._nonce }, '*');
            return;
        }
        this.intro.style.display = 'none';
        this.consentForm.style.display = 'none';
        document.getElementById('model-error').style.display = 'block';
    }

    async requestWebcamAccess() {
        try {
            if(!this.promises) {
                this.displayModelError();
                return;
            }

            this.stream = await navigator.mediaDevices.getUserMedia({ video: true });
            this.videoElement.onloadedmetadata = () => {
                this.videoElement.play();
                this.startAgeEstimation();
            };
            this.videoElement.srcObject = this.stream;
            this.intro.style.display = 'none';
            this.consentForm.style.display = 'none';
            this.webcamSection.style.display = 'block';
            
        } catch (error) {
            console.error('Error accessing webcam:', error);
            if(this._parentWillTakeControl) {
                window.opener.postMessage({ type: 'age-estimation-error', error: 'Error accessing webcam', nonce: this._nonce }, '*');
                return;
            }
            alert('Unable to access webcam. Please ensure you have granted permission and your webcam is working properly.');
        }
    }

    async startAgeEstimation() {
        const highProbabilityAges = [];
        const lowProbabilityAges = [];

        const processFrame = async () => {
            try {
                const detection = await faceapi.detectSingleFace(
                    this.videoElement,
                    new faceapi.TinyFaceDetectorOptions()
                ).withFaceLandmarks().withAgeAndGender();

                if (detection) {
                    const age = Math.round(detection.age);
                    const gender = detection.gender;
                    const genderProbability = Math.round(detection.genderProbability * 100);

                    // Update the processing text with results
                    //const resultText = `Estimated age: ${age} years (${gender} - ${genderProbability}% confidence)`;
                    this.webcamSection.querySelector('p').textContent = 'Processing age estimation...';

                    // If we have a referring website, send the age
                    if (document.referrer) {
                        window.parent.postMessage({ type: 'AGE_ESTIMATION', age }, document.referrer);
                    }

                    if(detection.detection.score > 0.9) {
                        highProbabilityAges.push({ age, score: detection.detection.score });
                        lowProbabilityAges.push({ age, score: detection.detection.score });
                    } else if(detection.detection.score > 0.75) {
                        lowProbabilityAges.push({ age, score: detection.detection.score });
                    } else {
                        this.webcamSection.querySelector('p').textContent = 'Please ensure your face is clearly visible in the camera view.';
                    }
                } else {
                    this.webcamSection.querySelector('p').textContent = 'No face detected. Please position your face in the camera view.';
                }
            } catch (error) {
                console.error('Error processing frame:', error);
            }

            // Schedule next frame
            if(highProbabilityAges.length >= 10) {
                this.stopWebcam();
                let averageAge = this.computeAverageAge(highProbabilityAges);
                if(this._parentWillTakeControl) {
                    window.opener.postMessage({ type: 'age-estimation-result', age: averageAge, nonce: this._nonce }, '*');
                } else {
                    this.displayAge(averageAge);
                }
            } else if(lowProbabilityAges.length >= 20) {
                this.stopWebcam();
                let averageAge = this.computeAverageAge(lowProbabilityAges);
                if(this._parentWillTakeControl) {
                    window.opener.postMessage({ type: 'age-estimation-result', age: averageAge, nonce: this._nonce }, '*');
                } else {
                    this.displayAge(averageAge);
                }
            } else {
                setTimeout(() => processFrame(), 250);
            }
        };

        // Start processing frames
        processFrame();
    }

    // compute weighted average where the score is the weight
    computeAverageAge(ages) {
        const totalAge = ages.reduce((sum, age) => sum + age.age * age.score, 0);
        const totalWeight = ages.reduce((sum, age) => sum + age.score, 0);
        return Math.floor(totalAge / totalWeight);
    }

    displayAge(age) {
        this.webcamSection.style.display = 'none';
        const resultsSection = document.getElementById('results-section');
        document.getElementById('estimated-age').textContent = `${age} years`;
        resultsSection.style.display = 'block';
    }

    stopWebcam() {
        if (this.stream) this.stream.getTracks().forEach(track => track.stop());
    }
}

let main = new Main();
export default main;
