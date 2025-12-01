// Check for duplicate quiz before saving
async function checkDuplicateQuiz(quizData) {
    try {
        const response = await fetch('check_auth.php');
        const authData = await response.json();
        
        if (!authData.loggedIn) {
            return { duplicate: false };
        }
        
        const checkResponse = await fetch('api/check_duplicate.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quiz_data: quizData })
        });
        
        const result = await checkResponse.json();
        return result;
    } catch (error) {
        console.error('Failed to check duplicate:', error);
        return { duplicate: false };
    }
}

// Auto-save quiz when generated
async function saveQuizToDatabase(quizData) {
    try {
        const response = await fetch('check_auth.php');
        const authData = await response.json();
        
        if (!authData.loggedIn) {
            console.log('User not logged in, quiz not saved to database');
            return null;
        }
        
        // Check for duplicate
        const dupCheck = await checkDuplicateQuiz(quizData);
        
        if (dupCheck.duplicate && dupCheck.quiz) {
            const quiz = dupCheck.quiz;
            const date = new Date(quiz.created_at).toLocaleDateString();
            const score = quiz.score !== null && quiz.total_questions > 0 
                ? Math.round((quiz.score / quiz.total_questions) * 100) + '%'
                : 'In Progress';
            
            const message = `⚠️ This quiz has already been taken!\n\nTaken on: ${date}\nScore: ${score}\n\nDo you want to retake it?`;
            
            if (!confirm(message)) {
                window.location.href = 'index.html';
                return null;
            }
        }
        
        const saveResponse = await fetch('api/save_quiz.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                quiz_name: 'Quiz ' + new Date().toLocaleDateString(),
                quiz_data: quizData,
                total_questions: quizData.length,
                status: 'in_progress'
            })
        });
        
        const result = await saveResponse.json();
        if (result.success) {
            console.log('Quiz saved with ID:', result.quiz_id);
            localStorage.setItem('current_quiz_id', result.quiz_id);
            return result.quiz_id;
        }
    } catch (error) {
        console.error('Failed to save quiz:', error);
    }
    return null;
}

// Update quiz score when completed
async function updateQuizScore(score, totalQuestions) {
    try {
        const quizId = localStorage.getItem('current_quiz_id');
        if (!quizId) return;
        
        await fetch('api/update_quiz.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                quiz_id: quizId,
                score: score,
                status: 'completed'
            })
        });
        
        localStorage.removeItem('current_quiz_id');
    } catch (error) {
        console.error('Failed to update quiz:', error);
    }
}
