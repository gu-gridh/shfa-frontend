<template>
    <div class="contact-container fullopacityui">
        <div class="settings-menu">
            <div class="version-badge">Version 1.3</div>
            <div class="top-button" @click="toggleLanguage" id="language-button">
                {{ currentLang === 'sv' ? 'English' : 'Svenska' }}
            </div>
            <div class="top-button" @click="toggleColour">
                <div id="colour-mode" class="material-symbols-outlined">
                    {{ currentColour === 'light' ? 'dark_mode' : 'light_mode' }}
                </div>
            </div>
        </div>

        <div class="logo-area">
            <div id="logo-contact"></div>
            <h1 class="about-title" v-html="$t('message.abouttitle')"></h1>
        </div>

        <div class="contact-form">
            <form @submit.prevent="handleSubmit" novalidate>
                <!-- Honeypot -->
                <input v-model="honeypot" type="text" autocomplete="off" tabindex="-1" class="hp" aria-hidden="true" />

                <div class="form-group-name">
                    <div>
                        <label for="name">{{ $t('message.name') }}</label>
                        <input id="name" v-model.trim="form.name" required :disabled="submitting" />
                    </div>
                </div>

                <div class="form-group">
                    <label for="email">{{ $t('message.email') }}</label>
                    <input id="email" v-model.trim="form.email" type="email" inputmode="email" autocomplete="email"
                        required :disabled="submitting" />
                </div>

                <div class="form-group">
                    <label for="subject">{{ $t('message.subject') }}</label>
                    <input id="subject" v-model.trim="form.subject" required :disabled="submitting" />
                </div>

                <div class="form-group">
                    <label for="message">{{ $t('message.yourMessage') }}</label>
                    <textarea id="message" v-model.trim="form.message" required :disabled="submitting"></textarea>
                </div>

                <button type="submit" :disabled="!canSubmit || submitting">
                    <span v-if="submitting">{{ $t('message.sending') }}</span>
                    <span v-else>{{ $t('message.sendMessage') }}</span>
                </button>

                <p v-if="status === 'ok'" class="status ok">{{ $t('message.thanks') }}</p>
                <p v-else-if="status === 'err'" class="status err">{{ $t('message.error') }}</p>
            </form>
        </div>
    </div>
</template>

<script>
export default {
    name: 'Contact',
    data() {
        return {
            currentLang: localStorage.getItem('userLang') || (this.$i18n?.locale || 'sv'),
            currentColour: localStorage.getItem('userColour') || 'light',
            form: { name: '', email: '', subject: '', message: '' },
            submitting: false,
            status: '',
            honeypot: '',
        }
    },
    computed: {
        canSubmit() {
            const { name, email, subject, message } = this.form
            if (!name || !email || !subject || !message) return false
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        }
    },
    mounted() {
        if (this.$i18n) this.$i18n.locale = this.currentLang
        document.documentElement.setAttribute('style-theme', this.currentColour)
    },
    methods: {
        toggleLanguage() {
            this.currentLang = this.currentLang === 'en' ? 'sv' : 'en'
            if (this.$i18n) this.$i18n.locale = this.currentLang
            localStorage.setItem('userLang', this.currentLang)
        },
        toggleColour() {
            this.currentColour = this.currentColour === 'dark' ? 'light' : 'dark'
            document.documentElement.setAttribute('style-theme', this.currentColour)
            localStorage.setItem('userColour', this.currentColour)
        },
        async handleSubmit() {
            if (this.honeypot) return
            if (!this.canSubmit || this.submitting) return

            this.submitting = true
            this.status = ''

            const SUBMIT_ENDPOINT = 'https://diana.dh.gu.se/shfa/contact/'
            const jsonPayload = {
                name: this.form.name,
                email: this.form.email,
                subject: this.form.subject,
                message: this.form.message
            }

            try {
                const res = await fetch(SUBMIT_ENDPOINT, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(jsonPayload)
                })

                if (!res.ok) throw new Error(`HTTP ${res.status}`)

                this.status = 'ok'
                this.form = { name: '', email: '', subject: '', message: '' }
            } catch (e) {
                console.error('submit error:', e)
                this.status = 'err'
            } finally {
                this.submitting = false
            }
        }
    }
}
</script>

<style scoped>
.contact-container {
    position: relative;
    color: var(--page-text);
    width: 100%;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    background: var(--guide-page-background);
    padding: 80px 0 0;
}

.settings-menu {
    position: fixed;
    top: 0;
    right: 0;
    z-index: 5000;
    display: flex;
    gap: 10px;
    align-items: center;
    padding: 12px 24px;
    font-size: 1.2em;
    font-weight: 400;
    color: var(--settings-text);
    cursor: default;
}

.top-button {
    width: max-content;
    height: 32px;
    line-height: 32px;
    float: right;
    text-align: left;
    margin-left: 0;
    padding: 0 10px;
    border-radius: 8px;
    cursor: pointer;
}

.top-button:hover {
    background-color: var(--button-hover-light);
}

.material-symbols-outlined {
    font-variation-settings:
        'FILL' 100,
        'wght' 200,
        'GRAD' 0,
        'opsz' 24;
    padding: 1px;
    color: var(--settings-text);
    cursor: pointer;
}

.logo-area {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 16px;
    margin: 24px 0 40px;
    width: 100%;
    padding: 0;
}

#logo-contact {
    position: relative;
    width: 210px;
    height: 200px;
    background: var(--shfa-logo);
    background-repeat: no-repeat;
    background-size: contain;
    opacity: 0.7;
    transition: all 0.8s ease-in-out;
}

.contact-form {
    width: 100%;
    max-width: 900px;
    margin: 0 auto 40px auto;
    padding: 0 100px;
    box-sizing: border-box;
}

.form-group-name {
    display: flex;
    gap: 10px;
    margin-bottom: 10px;
}

.form-group-name>div {
    flex: 1;
}

.form-group {
    margin-bottom: 10px;
}

.version-badge {
    position: fixed;
    left: 12px;
    z-index: 5001;
    font-size: 15px;
    color: var(--settings-text);
    padding: 12px 24px;
    border-radius: 6px;
    background: transparent;
}

input,
textarea {
    width: 100%;
    padding: 8px;
    border: 1px solid var(--theme-5, #ccd);
    border-radius: 4px;
    box-sizing: border-box;
    font: inherit;
    color: #000;
    background: #fff;
}

textarea {
    min-height: 120px;
    resize: vertical;
}

button:disabled {
    opacity: .6;
    cursor: not-allowed;
}

button:hover:not(:disabled) {
    background: var(--theme-3, #555);
}

.status {
    margin-top: .75rem;
    font-size: .95rem;
}

.status.ok {
    color: #1a7f37;
}

.status.err {
    color: #b3261e;
}

/* honeypot */
.hp {
    position: absolute !important;
    left: -9999px !important;
    width: 1px;
    height: 1px;
    opacity: 0;
}

button {
    width: auto;
    max-width: 220px;
    padding: 10px 16px;
    background: var(--theme-1, #333);
    color: #fff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    display: block;
    margin-left: auto;
}

@media (max-width: 600px) {
    .contact-form {
        max-width: 100%;
        padding: 0 16px;
    }
}

@media (max-width: 480px) {
    .logo-area {
        justify-content: center;
        align-items: center;
        margin-top: 20px;
        padding-left: 0;
    }

    #logo-contact {
        width: 120px;
        height: 100px;
        margin-right: 10px;
    }

    .about-title {
        font-size: 35px;
        padding-left: 10px;
    }
}
</style>