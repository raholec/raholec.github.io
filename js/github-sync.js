class GitHubPortfolio {
    constructor(username) {
        this.username = username;
        this.apiBase = 'https://api.github.com';
        this.init();
    }

    async init() {
        await this.fetchAndUpdateProfile();
        this.startAutoUpdate();
    }

    async fetchAndUpdateProfile() {
        try {
            const [profile, repos, events] = await Promise.all([
                this.fetchProfile(),
                this.fetchRepositories(),
                this.fetchEvents()
            ]);

            this.updateUI(profile, repos, events);
            this.updateLastUpdateTime();
        } catch (error) {
            console.error('Chyba při načítání dat:', error);
        }
    }

    async fetchProfile() {
        const response = await fetch(`${this.apiBase}/users/${this.username}`);
        return response.json();
    }

    async fetchRepositories() {
        const response = await fetch(`${this.apiBase}/users/${this.username}/repos?sort=updated&per_page=100`);
        return response.json();
    }

    async fetchEvents() {
        const response = await fetch(`${this.apiBase}/users/${this.username}/events/public`);
        return response.json();
    }

    updateUI(profile, repos, events) {
        // Základní profil
        document.getElementById('profile-image').src = profile.avatar_url;
        document.getElementById('profile-name').textContent = profile.name || profile.login;
        document.getElementById('profile-bio').textContent = profile.bio || '';
        document.getElementById('github-link').href = profile.html_url;

        if (profile.email) {
            const emailLink = document.getElementById('email-link');
            emailLink.href = `mailto:${profile.email}`;
            emailLink.classList.remove('hidden');
        }

        if (profile.blog) {
            const websiteLink = document.getElementById('website-link');
            websiteLink.href = profile.blog;
            websiteLink.classList.remove('hidden');
        }

        // Projekty
        this.updateProjects(repos);
        
        // Dovednosti
        this.updateSkills(repos);
        
        // Aktivita
        this.updateActivity(events);
    }

    updateProjects(repos) {
        const projectsList = document.getElementById('projects-list');
        const topProjects = repos
            .filter(repo => !repo.fork)
            .sort((a, b) => b.stargazers_count - a.stargazers_count)
            .slice(0, 6);

        projectsList.innerHTML = topProjects.map(repo => `
            <div class="project-card">
                <h3>${repo.name}</h3>
                <p>${repo.description || 'Bez popisu'}</p>
                <div class="project-meta">
                    <span>${repo.language || 'Různé'}</span>
                    <span>⭐ ${repo.stargazers_count}</span>
                </div>
                <a href="${repo.html_url}" target="_blank">Zobrazit projekt</a>
            </div>
        `).join('');
    }

    updateSkills(repos) {
        const skills = new Set();
        repos.forEach(repo => {
            if (repo.language) skills.add(repo.language);
        });

        const skillsList = document.getElementById('skills-list');
        skillsList.innerHTML = Array.from(skills)
            .map(skill => `<span class="skill-tag">${skill}</span>`)
            .join('');
    }

    updateActivity(events) {
        const activityList = document.getElementById('activity-list');
        const recentEvents = events.slice(0, 10);

        activityList.innerHTML = recentEvents.map(event => `
            <div class="activity-item">
                <span>${this.formatEventType(event.type)}</span>
                <a href="https://github.com/${event.repo.name}" target="_blank">
                    ${event.repo.name}
                </a>
                <span>${this.formatDate(event.created_at)}</span>
            </div>
        `).join('');
    }

    formatEventType(type) {
        const types = {
            PushEvent: '🔨 Push',
            CreateEvent: '✨ Create',
            PullRequestEvent: '🔃 Pull Request',
            IssuesEvent: '❗️ Issue',
            IssueCommentEvent: '💬 Comment'
        };
        return types[type] || type;
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('cs-CZ');
    }

    updateLastUpdateTime() {
        document.getElementById('last-update').textContent = 
            new Date().toLocaleString('cs-CZ');
    }

    startAutoUpdate() {
        // Aktualizace každé 3 hodiny
        setInterval(() => this.fetchAndUpdateProfile(), 3 * 60 * 60 * 1000);
    }
}

// Inicializace po načtení stránky
document.addEventListener('DOMContentLoaded', () => {
    // Zde změňte 'username' na vaše GitHub uživatelské jméno
    const portfolio = new GitHubPortfolio('raholec');
});