function selectPackage(packageName) {
    document.getElementById('package-selection').style.display = 'none';
    const formSection = document.getElementById('booking-form-section');
    formSection.classList.remove('hidden');
    formSection.style.display = 'block'; // Ensure block display

    document.getElementById('package-input').value = packageName;
    document.getElementById('selected-package-display').textContent = `SELECTED PACKAGE: ${packageName}`;
}

function goBack() {
    document.getElementById('booking-form-section').style.display = 'none';
    const selection = document.getElementById('package-selection');
    selection.style.display = 'grid'; // Reset to grid

    // reset form opacity for animation
}

document.getElementById('booking-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const submitBtn = document.querySelector('.btn-submit');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'PROCESSING...';
    submitBtn.disabled = true;

    // Collect data
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    try {
        const response = await fetch('/api/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
            // Show success screen
            document.getElementById('booking-form-section').style.display = 'none';
            const successScreen = document.getElementById('success-screen');
            successScreen.classList.remove('hidden');
            successScreen.style.display = 'block';
        } else {
            alert('Something went wrong. Please try again.');
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Network error. Check your connection.');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
});
