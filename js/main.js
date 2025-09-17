document.addEventListener('DOMContentLoaded', function() {
    // Form functionality
    const form = document.getElementById('lead-form');
    const questions = document.querySelectorAll('.question');
    const progressFill = document.querySelector('.progress-fill');
    const currentStepSpan = document.getElementById('current-step');
    const totalStepsSpan = document.getElementById('total-steps');
    const backButton = document.querySelector('.btn-back');

    let currentStep = 1;
    const totalSteps = questions.length;
    totalStepsSpan.textContent = totalSteps;

    // Update progress bar
    function updateProgress() {
        const progress = (currentStep / totalSteps) * 100;
        progressFill.style.width = progress + '%';
        currentStepSpan.textContent = currentStep;
    }

    // Show specific step
    function showStep(step) {
        questions.forEach(q => q.classList.remove('active'));
        const targetQuestion = document.querySelector(`[data-step="${step}"]`);
        if (targetQuestion) {
            targetQuestion.classList.add('active');
        }

        // Show/hide back button
        backButton.style.display = step > 1 ? 'block' : 'none';

        updateProgress();
    }

    // Next button functionality
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('btn-next')) {
            const currentQuestion = document.querySelector('.question.active');
            const input = currentQuestion.querySelector('input[required]');

            if (input && input.type === 'text' && !input.value.trim()) {
                input.focus();
                return;
            }

            if (input && input.type === 'radio') {
                const radioButtons = currentQuestion.querySelectorAll('input[type="radio"]');
                let isChecked = false;
                radioButtons.forEach(radio => {
                    if (radio.checked) isChecked = true;
                });

                if (!isChecked) {
                    return;
                }
            }

            if (currentStep < totalSteps) {
                currentStep++;
                showStep(currentStep);
            }
        }
    });

    // Radio button auto-advance
    document.addEventListener('change', function(e) {
        if (e.target.type === 'radio' && currentStep < totalSteps) {
            setTimeout(() => {
                currentStep++;
                showStep(currentStep);
            }, 500);
        }
    });

    // Back button functionality
    backButton.addEventListener('click', function() {
        if (currentStep > 1) {
            currentStep--;
            showStep(currentStep);
        }
    });

    // Form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        // Validate final step
        const finalQuestion = document.querySelector('[data-step="5"]');
        const requiredInputs = finalQuestion.querySelectorAll('input[required]');
        let allValid = true;

        requiredInputs.forEach(input => {
            if (!input.value.trim()) {
                allValid = false;
                input.focus();
                return;
            }
        });

        if (!allValid) return;

        // Show success message (in a real app, you'd send this data to a server)
        const formCard = document.querySelector('.form-card');
        formCard.innerHTML = `
            <div class="form-header">
                <h2>Thank You!</h2>
                <p>We're finding the best quotes for you...</p>
            </div>
            <div style="text-align: center; padding: 2rem;">
                <div style="width: 60px; height: 60px; margin: 0 auto 1rem; border: 3px solid #2563eb; border-radius: 50%; border-top-color: transparent; animation: spin 1s linear infinite;"></div>
                <p style="color: #6b7280;">You'll receive your personalized quotes via email within 5 minutes.</p>
            </div>
            <style>
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            </style>
        `;
    });

    // Mobile navigation
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
    }

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Form validation enhancements
    const inputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"]');

    inputs.forEach(input => {
        input.addEventListener('input', function() {
            if (this.type === 'tel') {
                // Basic phone number formatting
                let value = this.value.replace(/\D/g, '');
                if (value.length >= 6) {
                    value = value.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
                } else if (value.length >= 3) {
                    value = value.replace(/(\d{3})(\d{0,3})/, '($1) $2');
                }
                this.value = value;
            }

            if (this.name === 'zipcode') {
                // Only allow numbers for zipcode
                this.value = this.value.replace(/\D/g, '').substring(0, 5);
            }
        });

        input.addEventListener('blur', function() {
            this.classList.toggle('error', this.required && !this.value.trim());
        });
    });

    // Initialize
    showStep(1);
});