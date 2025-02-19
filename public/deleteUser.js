$(() => {

    const deleteAccount = async (email, password) => {
        try {

            const result = await Swal.fire({
                title: 'Are you sure?',
                text: 'You will not be able to recover your account! All your data will be lost!',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, delete it!',
                cancelButtonText: 'No, cancel!',
                reverseButtons: true
            });

            if (!result.isConfirmed) {
                return;
            }

            const url = `/wanderInn/api/v1/deleteUserURL`;

            const headers = {
                'Content-Type': 'application/json'
            };

            const options = {
                method: 'POST',
                headers,
                body: JSON.stringify({ email, password })
            };

            const response = await fetch(url, options);

            const data = await response.json();

            if (!response.ok) {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: typeof data?.message === 'string' ? data.message : 'Something went wrong!',
                });

                return;
            };

            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: typeof data?.message === 'string' ? data.message : 'Password reset successfully!',
            })
            .then(() => {
                $('#deleteUserForm').trigger('reset');
            });
        } catch (error) {
            console.error('Error:', error);
        }
    }

    $('#deleteUserForm').submit((e) => {
        e.preventDefault()
        
        const email = $('#email').val();    
        const password = $('#password').val();

        const isEmailValid = email.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i);
        
        if (!isEmailValid) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Please enter a valid email!',
            });

            return;
        };


        // Delete User
        deleteAccount(email, password);
        
    });
})
