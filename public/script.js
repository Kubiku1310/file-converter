document.addEventListener('DOMContentLoaded', () => {
    const selectedFormat = document.getElementById('selectedFormat');
    const optionsContainer = document.getElementById('optionsContainer');
    const searchInput = document.getElementById('searchInput');
    const optionsContent = document.getElementById('optionsContent');
    const convertButton = document.getElementById('convertButton');
    const fileInput = document.getElementById('file');
    const spinner = document.getElementById('spinner');
    const fileUrl = document.getElementById('fileUrl');
    const fileNameDisplay = document.getElementById('fileName'); // Displaying the chosen file name

    let selectedValue = '';
    let fileType = '';

    // Define formats
    const formats = {
        'audio': ['mp3', 'wav', 'm4a', 'ogg', 'm4r', 'wma', 'mp2', 'aac', 'flac', 'amr', 'sd2', 'voc', 'ra', 'vox', 'cvsd'],
        'video': ['mp4', 'avi', 'webm', 'mkv', 'mov', 'flv', 'wmv', 'mpeg', 'mpg', '3gp', '3g2', 'divx', 'xvid', 'mts', 'm2ts', 'ts', 'vob'],
        'image': ['png', 'jpg', 'webp', 'svg'],
        'document': ['pdf', 'docx', 'xlsx', 'pptx'],
        'archive': ['zip']
    };

    // Populate options dynamically
    function populateOptions() {
        Object.keys(formats).forEach(category => {
            const categoryGroup = document.createElement('div');
            categoryGroup.classList.add('option-group');
            const label = document.createElement('label');
            label.textContent = `${category.charAt(0).toUpperCase() + category.slice(1)} Formats`;
            categoryGroup.appendChild(label);
            formats[category].forEach(format => {
                const option = document.createElement('div');
                option.classList.add('option');
                option.textContent = format.toUpperCase();
                option.setAttribute('data-value', format);
                categoryGroup.appendChild(option);
            });
            optionsContent.appendChild(categoryGroup);
        });
    }

    populateOptions();

    selectedFormat.addEventListener('click', () => {
        optionsContainer.style.display = optionsContainer.style.display === 'none' ? 'block' : 'none';
    });

    optionsContent.addEventListener('click', (event) => {
        if (event.target.classList.contains('option')) {
            selectedValue = event.target.getAttribute('data-value');
            selectedFormat.textContent = event.target.textContent;
            optionsContainer.style.display = 'none';
        }
    });

    searchInput.addEventListener('input', () => {
        const filter = searchInput.value.toLowerCase();
        document.querySelectorAll('.option').forEach(option => {
            const text = option.textContent.toLowerCase();
            option.style.display = text.includes(filter) ? 'block' : 'none';
        });
    });

    fileInput.addEventListener('change', () => {
        const file = fileInput.files[0];
        if (file) {
            fileType = file.name.split('.').pop().toLowerCase();
            fileNameDisplay.textContent = file.name; // Display the chosen file name
        } else {
            fileNameDisplay.textContent = 'No file chosen'; // Reset if no file is chosen
        }
    });

    convertButton.addEventListener('click', () => {
        if (fileInput.files.length === 0) {
            alert('Please select a file to convert.');
            return;
        }

        if (!selectedValue) {
            alert('Please select a format to convert to.');
            return;
        }

        // Validate conversion
        const incompatibleConversions = {
            'mp4': ['pptx', 'jpg', 'png'],
            'avi': ['pptx', 'jpg', 'png'],
            'mp3': ['pptx'],
            // Add more rules as needed
        };

        if (incompatibleConversions[fileType] && incompatibleConversions[fileType].includes(selectedValue)) {
            alert(`Cannot convert ${fileType.toUpperCase()} to ${selectedValue.toUpperCase()}.`);
            return;
        }

        // Show loading spinner
        spinner.style.display = 'block';

        const formData = new FormData();
        formData.append('files', fileInput.files[0]);
        formData.append('format', selectedValue);

        fetch('/convert', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            spinner.style.display = 'none';
            if (data.success) {
                fileUrl.innerHTML = `<a href="${data.fileUrl}" download>Download your file</a>`;
            } else {
                fileUrl.textContent = 'Conversion failed. Please try again.';
            }
        })
        .catch(error => {
            spinner.style.display = 'none';
            fileUrl.textContent = 'An error occurred. Please try again.';
            console.error('Error:', error);
        });
    });
});
