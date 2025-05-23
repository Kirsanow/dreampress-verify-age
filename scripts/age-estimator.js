class AgeEstimator {
    constructor() {

    }

    /**
     * Verify age
     * @param {Object} params - The parameters for the age verification
     * @param {Function} params.successCallback - The callback function to call if the age verification is successful (optional)
     * @param {Function} params.errorCallback - The callback function to call if the age verification fails (optional)
     */
    verifyAge(params = {}) {
        let nonce = Math.random().toString(36).substring(2, 15);
        let url = params.localTesting ? '../index.html' : 'https://universal-verify.github.io/age-estimator/';
        let origin = params.localTesting ? window.location.origin : 'https://universal-verify.github.io';
        const newTab = window.open(url, '_blank');
        window.addEventListener('message', (event) => {
            if(event.source !== newTab) return;
            if(event.data.type === 'age-estimation-result') {
                if(event.data.nonce !== nonce) return;
                if(params.successCallback) {
                    params.successCallback(event.data.age);
                } else {
                    console.log('Missing successCallback for age estimation');
                }
                newTab.close();
            } else if(event.data.type === 'age-estimation-error') {
                if(params.errorCallback) {
                    if(event.data.nonce !== nonce) return;
                    params.errorCallback(event.data.error);
                } else {
                    console.log('Missing errorCallback for age estimation');
                }
                newTab.close();
            } else if(event.data.type === 'check-parent-commandeer') {
                newTab.postMessage({ type: 'confirm-parent-commandeer', nonce }, origin);
            }
        });
    }
}

const ageEstimator = new AgeEstimator();
export default ageEstimator;