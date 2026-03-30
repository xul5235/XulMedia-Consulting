document.addEventListener('DOMContentLoaded', () => {
    
    // Only run if we are on the chat page
    const chatWindow = document.getElementById('chat-window');
    const chatControls = document.getElementById('chat-controls');
    if (!chatWindow || !chatControls) return;

    let currentState = 0;
    const brief = {
        businessType: '',
        visualGoal: '',
        email: ''
    };

    // Helper: get localized text dynamically based on current lang
    function getT(key) {
        const lang = localStorage.getItem('xulmedia_lang') || 'en';
        return translations[lang][key];
    }

    function scrollToBottom() {
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }

    function showTypingIndicator() {
        return new Promise(resolve => {
            const typingDiv = document.createElement('div');
            typingDiv.className = 'typing-indicator';
            typingDiv.innerHTML = `
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            `;
            chatWindow.appendChild(typingDiv);
            scrollToBottom();

            setTimeout(() => {
                typingDiv.remove();
                resolve();
            }, 1200); // 1.2s typing delay
        });
    }

    async function botMessage(textKey) {
        chatControls.classList.remove('visible');
        await showTypingIndicator();

        const bubble = document.createElement('div');
        bubble.className = 'chat-bubble bot';
        // We set a data attribute so it can be re-translated if lang switches mid-chat
        bubble.setAttribute('data-i18n', textKey); 
        bubble.textContent = getT(textKey);
        
        chatWindow.appendChild(bubble);
        scrollToBottom();
    }

    function userMessage(textKey, fallbackText) {
        const bubble = document.createElement('div');
        bubble.className = 'chat-bubble user';
        
        if (textKey) {
            bubble.setAttribute('data-i18n', textKey);
            bubble.textContent = getT(textKey);
        } else {
            bubble.textContent = fallbackText;
        }

        chatWindow.appendChild(bubble);
        scrollToBottom();
    }

    function renderControls(html) {
        chatControls.innerHTML = html;
        chatControls.classList.add('visible');
    }

    // STATE MACHINE
    async function runState(state) {
        if (state === 0) {
            await botMessage('chat_bot1');
            renderControls(`
                <button class="chat-btn" data-key="chat_opt1_a" data-i18n="chat_opt1_a"></button>
                <button class="chat-btn" data-key="chat_opt1_b" data-i18n="chat_opt1_b"></button>
                <button class="chat-btn" data-key="chat_opt1_c" data-i18n="chat_opt1_c"></button>
                <button class="chat-btn" data-key="chat_opt1_d" data-i18n="chat_opt1_d"></button>
            `);
            // Ensure newly injected controls have text immediately
            updateDOMTranslations();

            const btns = chatControls.querySelectorAll('.chat-btn');
            btns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const key = e.target.getAttribute('data-key');
                    // Save English raw value for the email logic
                    brief.businessType = translations['en'][key]; 
                    userMessage(key);
                    currentState = 1;
                    setTimeout(() => runState(currentState), 300);
                });
            });

        } else if (state === 1) {
            await botMessage('chat_bot2');
            renderControls(`
                <button class="chat-btn" data-key="chat_opt2_a" data-i18n="chat_opt2_a"></button>
                <button class="chat-btn" data-key="chat_opt2_b" data-i18n="chat_opt2_b"></button>
                <button class="chat-btn" data-key="chat_opt2_c" data-i18n="chat_opt2_c"></button>
            `);
            updateDOMTranslations();

            const btns = chatControls.querySelectorAll('.chat-btn');
            btns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const key = e.target.getAttribute('data-key');
                    brief.visualGoal = translations['en'][key];
                    userMessage(key);
                    currentState = 2;
                    setTimeout(() => runState(currentState), 300);
                });
            });

        } else if (state === 2) {
            await botMessage('chat_bot3');
            renderControls(`
                <div class="chat-input-wrapper">
                    <input type="email" id="chat-email-input" class="chat-input" data-i18n-placeholder="chat_input_email" placeholder="Enter your email...">
                    <button class="chat-btn-submit" id="chat-email-btn" data-i18n="chat_btn_next">Next</button>
                </div>
            `);
            updateDOMTranslations();

            const btn = document.getElementById('chat-email-btn');
            const input = document.getElementById('chat-email-input');
            
            btn.addEventListener('click', handleEmailSubmit);
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') handleEmailSubmit();
            });

            function handleEmailSubmit() {
                const val = input.value.trim();
                if (!val || !val.includes('@')) return; // Basic validation
                brief.email = val;
                userMessage(null, val);
                currentState = 3;
                setTimeout(() => runState(currentState), 300);
            }

        } else if (state === 3) {
            await botMessage('chat_bot4');
            renderControls(`
                <button class="chat-btn-submit" id="chat-finish-btn" style="width:100%;" data-i18n="chat_btn_send">Send Details to Xul</button>
            `);
            updateDOMTranslations();

            const btn = document.getElementById('chat-finish-btn');
            btn.addEventListener('click', () => {
                const subject = encodeURIComponent("New Project Inquiry via XULMEDIA Bot");
                const body = encodeURIComponent(`Hi Xul,\n\nI just completed the intake bot. Here is my brief:\n\nBusiness Type: ${brief.businessType}\nVisual Goal: ${brief.visualGoal}\nMy Email: ${brief.email}\n\nLet's connect!\n`);
                window.location.href = `mailto:xullagomarsino@gmail.com?subject=${subject}&body=${body}`;
            });
        }
    }

    // Custom translator for dynamic DOM injections (since script.js mostly hits index on domload)
    function updateDOMTranslations() {
        const lang = localStorage.getItem('xulmedia_lang') || 'en';
        const t = translations[lang];
        if (!t) return;

        chatWindow.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (t[key]) el.textContent = t[key];
        });
        chatControls.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (t[key]) el.textContent = t[key];
        });
        chatControls.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            if (t[key]) el.placeholder = t[key];
        });
    }

    // Override the core script.js applyLanguage logic just slightly for this page
    // so it keeps our active chat bubbles translated
    const bodyLangButtons = document.querySelectorAll('.lang-btn');
    bodyLangButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            setTimeout(updateDOMTranslations, 50); // slight delay to let script.js finish core update
        });
    });

    // Start Chat
    setTimeout(() => runState(0), 500);

});
