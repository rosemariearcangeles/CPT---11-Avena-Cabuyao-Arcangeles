async function saveQuizToDatabase(quizData) {
    console.log('Saving quiz...');
    
    try {
        const authResponse = await fetch('check_auth.php');
        const authData = await authResponse.json();
        
        if (!authData.loggedIn) {
            console.log('Not logged in');
            return null;
        }
        
        console.log('User logged in, saving...');
        
        const response = await fetch('api/save_quiz.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                quiz_name: 'Quiz ' + new Date().toLocaleDateString(),
                quiz_data: quizData,
                total_questions: quizData.length
            })
        });
        
        const result = await response.json();
        console.log('Save result:', result);
        
        if (result.success) {
            localStorage.setItem('current_quiz_id', result.quiz_id);
            return result.quiz_id;
        }
    } catch (error) {
        console.error('Save error:', error);
    }
    return null;
}

async function updateQuizScore(score, totalQuestions) {
    const quizId = localStorage.getItem('current_quiz_id');
    if (!quizId) return;
    
    console.log('Updating score:', score);
    
    try {
        await fetch('api/update_quiz.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                quiz_id: quizId,
                score: score
            })
        });
        
        localStorage.removeItem('current_quiz_id');
    } catch (error) {
        console.error('Update error:', error);
    }
}
