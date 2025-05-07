
const ENCRYPTION_KEY = 'q5kq0nckcmfJsXvCx-P-nU3IOcT_odDndllXhcnyrY8=';

document.getElementById('signup-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const userName = document.getElementById('user-name').value;
    const userEmail = document.getElementById('user-email').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;

    // 비밀번호 일치 검증
    if (password !== passwordConfirm) {
        Swal.fire({
            icon: 'error',
            title: '오류',
            text: '비밀번호와 비밀번호 재확인이 일치하지 않습니다.',
        });
        return;
    }

    try {
        // 기존 사용자 확인
        const users = JSON.parse(localStorage.getItem('users') || '[]');

        if (users.some(user => user.user_email === userEmail)) {
            throw new Error('이미 등록된 이메일입니다.');
        }

        // 비밀번호 해시
        const hashedPassword = CryptoJS.SHA256(password + ENCRYPTION_KEY).toString();

        // 사용자 데이터 저장
        const userData = {
            user_id: userEmail,
            user_name: userName,
            user_email: userEmail,
            password: hashedPassword,
        };
        users.push(userData);
        localStorage.setItem('users', JSON.stringify(users));

        // 로그인 상태 저장
        localStorage.setItem('user_id', userEmail);

        // 성공 알림
        await Swal.fire({
            icon: 'success',
            title: '회원가입 완료',
            text: '회원가입을 완료했습니다.',
            confirmButtonText: '확인',
        });

        // 홈 화면으로 이동
        window.location.href = '../templates/index.html';
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: '오류',
            text: error.message || '회원가입 중 오류가 발생했습니다.',
        });
    }
});