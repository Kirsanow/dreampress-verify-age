class Main {
    constructor() {
        this.consentForm = document.getElementById('consent-form');
        this.webcamSection = document.getElementById('webcam-section');
        this.videoElement = document.getElementById('webcam');
        this.stream = null;

        this.initializeEventListeners();
    }

    initializeEventListeners() {
        if (this.consentForm) {
            this.consentForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const consentCheckbox = document.getElementById('biometric-consent');
                if (consentCheckbox.checked) {
                    this.requestWebcamAccess();
                }
            });
        }
    }

    async requestWebcamAccess() {
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({ video: true });
            this.videoElement.srcObject = this.stream;
            this.consentForm.style.display = 'none';
            this.webcamSection.style.display = 'block';
        } catch (error) {
            console.error('Error accessing webcam:', error);
            alert('Unable to access webcam. Please ensure you have granted permission and your webcam is working properly.');
        }
    }
}

let main = new Main();
export default main;
