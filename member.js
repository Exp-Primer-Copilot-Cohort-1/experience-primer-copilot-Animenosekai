function skillsMember() {
    const skills = document.querySelectorAll('.skills');
    const skillsLength = skills.length;
    for (let i = 0; i < skillsLength; i++) {
        skills[i].addEventListener('click', function() {
            this.classList.toggle('active');
        });
    }
}