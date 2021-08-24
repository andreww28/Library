function Book(title,author,genre,total_page, page_read, book_cover, img_file_name){
    this.title = title;
    this.author = author;
    this.genre = genre;
    this.total_page = total_page;
    this.page_read = page_read;
    this.book_cover = book_cover;
    this.image_file_name = img_file_name;
}

const Library_Event = function(){
    const add_book_btn = document.getElementById('show-form-btn');
    const remove_all_book_btn = document.querySelector('.remove-all-book');
    const show_library_info_btn = document.querySelector('.hide-library-info-btn');
    const sort_menu = document.querySelector('#sort');

    const search_field = document.querySelector('#search');

    function addEvent(){
        search_field.addEventListener('keyup', Search_Book.search.bind(event), false);
        show_library_info_btn.addEventListener('click', Library_Info.showOrHide, false);
        add_book_btn.addEventListener('click', Book_Form.show_add_book_form, false);
        remove_all_book_btn.addEventListener('click', Main_Library.reset, false);
        sort_menu.addEventListener('change', Main_Library.sort_book.bind(event), false);
    }

    function removeEvent(){
        search_field.removeEventListener('keyup', Search_Book.search.bind(event), false);
        show_library_info_btn.removeEventListener('click', Library_Info.showOrHide, false);
        add_book_btn.removeEventListener('click', Book_Form.show_add_book_form, false);
        remove_all_book_btn.removeEventListener('click', Main_Library.reset, false);
        sort_menu.removeEventListener('change', Main_Library.sort_book.bind(event), false);
    }

    return {addEvent, removeEvent};
}();


const Library_Info = function(){
    function showOrHide(){
        const show_library_info_btn_text = document.querySelector('.hide-library-info-btn > p');

        if(show_library_info_btn_text.textContent === '>'){
            gsap.to('.left-frame', {duration: 1, x:2});
            show_library_info_btn_text.textContent = '<';
            Main_Library.blurBackground(exclude_library_info_frame = true);

        }else{
            gsap.to('.left-frame', {duration: 1, x:-287});
            show_library_info_btn_text.textContent = '>';
            Main_Library.unBlurBackground(exclude_library_info_frame = true);
        }
    }

    function render(){
        const myLibrary = Main_Library.getMyLibrary();
        let field_value = document.querySelectorAll('.info-library-subtitles + p'); //All values of subtitle in left frame
        
        let total_books = myLibrary.length;
        let books_completed = myLibrary.filter(book => book.total_page == book.page_read).length;
        let total_pages = myLibrary.reduce((total, book) => { return total + parseInt(book.total_page)},0);
        let page_completed = myLibrary.reduce((total, book) => {return total + parseInt(book.page_read)},0);
        let remaining_page = total_pages - page_completed;

        field_value[0].textContent = total_books;
        field_value[1].textContent = books_completed;
        field_value[2].textContent = total_pages;
        field_value[3].textContent = page_completed;
        field_value[4].textContent = remaining_page;
    }

    return {showOrHide,
            render,
           };
}();


const Main_Library = function(){
    const main_container = document.getElementById('main-container');
    const header = document.querySelector('header');
    const library_info_frame = document.querySelector('.left-frame');
    const book_collection = document.getElementById("book-collection");
        
    let myLibrary = [];
    let selected_img_path = '';
    let book_img_file_name = '';

    function blurBackground(exclude_library_info_frame = false){
        main_container.style.filter = 'blur(8px)';
        header.style.filter = 'blur(8px)';
        if(!exclude_library_info_frame){
            library_info_frame.style.filter = 'blur(8px)';
        }

        Library_Event.removeEvent();
        let more_info_btns = Array.from(document.querySelectorAll('.more-info'));
        console.log(more_info_btns)
        more_info_btns.forEach(btn => {
            btn.removeEventListener('click', Book_Info.init.bind(event, more_info_btns), false)
            console.log('fdsf')
        });
    }

    function unBlurBackground(exclude_library_info_frame = false){
        main_container.style.filter = 'blur(0px)';
        header.style.filter = 'blur(0px)';
        if(!exclude_library_info_frame){
            library_info_frame.style.filter = 'blur(0px)';
        }

        Library_Event.addEvent();
    }

    function add_data_to_LocalStorage(){
        localStorage.setItem('books_collection', JSON.stringify(myLibrary));    //convert the array of objects to string
        Library_Info.render();
    }

    function retrieve_data(){
        if(localStorage.length){
            if(localStorage.option_value){
                document.querySelector('#sort').value = localStorage.getItem('option_value');
            }
    
            var datas = JSON.parse(localStorage["books_collection"]);   //convert the string of the array to array of objects
            myLibrary = datas;
            render();
        }
    }

    function addToMyLibrary(book_obj){
        myLibrary.push(book_obj);
    }

    function removeBookToLibrary(index){
        myLibrary.splice(index, 1);
        render();
        Library_Info.render();
    }

    function render(){
        book_collection.innerHTML = '';

        if(!myLibrary.length){
            _create_book_element(book_collection, 'h2', 'empty-book-title', 'Create New Book Now');
            add_data_to_LocalStorage();
            return
        }else{
            display_book();
        }

    }   

    function display_book(){
        myLibrary.forEach((book)=>{
            let book_parent_tag = document.createElement('div');
            book_parent_tag.classList.add("book");
            book_collection.appendChild(book_parent_tag);
    
            _create_book_element(parent = book_parent_tag, tag = 'img', _class = 'book-cover', content='', img_source = book.book_cover);
            _create_book_element(parent = book_parent_tag, tag = 'h4', _class = 'book-title', content = book.title);
            _create_book_element(parent = book_parent_tag, tag = 'p', _class = 'author', content = `<em>${book.author}</em>`);
            _create_book_element(parent = book_parent_tag, tag = 'div', _class = 'progress-bar', content = '');
            _create_book_element(parent = book_parent_tag, tag = 'p', _class = 'page-count', content = `Pages: ${book.page_read}/${book.total_page}`);
            _create_book_element(parent = book_parent_tag, tag = 'div', _class = 'more-info', content = 'i');
    
            let color_progress_bars = document.querySelectorAll('.book > .progress-bar');
            let current_progress_bar = color_progress_bars[color_progress_bars.length - 1]; 
            update_book_progress(book.page_read, book.total_page, current_progress_bar);
    
            let book_parents = document.querySelectorAll('.book');
            let book_covers = document.querySelectorAll('.book-cover');
            let titles = document.querySelectorAll(".book-title");
    
            let current_book_parent = book_parents[book_parents.length - 1];
            current_book_cover = book_covers[book_covers.length-1];        
            let current_title = titles[titles.length - 1];
    
            let title_length = current_title.textContent.length;
            let front_word = current_title.textContent.substring(0, 14);
    
            if(book.book_cover === undefined || book.book_cover === ''){
                current_book_parent.removeChild(current_book_cover);
                current_title.classList.add('center-title');
                return;
            }
    
            if(title_length > 12){
                cut_title = front_word.replace(/(...)$/, '...');
                current_title.textContent = cut_title;
            }
        });

        add_data_to_LocalStorage();
        let more_info_btns = Array.from(document.querySelectorAll('.more-info'));
        more_info_btns.forEach(btn => btn.addEventListener('click', Book_Info.init.bind(event, more_info_btns), false));
    }

    function _create_book_element(parent, tag, _class, content, img_source){
        let child = document.createElement(tag);
        child.classList.add(_class);
        child.innerHTML = content;
        parent.appendChild(child);
    
        if(tag == 'img') {
            child.src = img_source;
        }
    }

    function update_book_progress(page_read, total_page, progress_bar){
        let width = (parseInt(page_read) / parseInt(total_page)) * 100;
        progress_bar.style.setProperty('--progress-bar-width' , `${width}%`);
    }

    function reset(){
        myLibrary = [];
        add_data_to_LocalStorage();
        render();
    }

    function sort_book(e){
        option_value = e.target.value;
        if(myLibrary.length && option_value != ''){
            if(option_value === 'total_page' || option_value === 'page_read'){
                myLibrary.sort((a, b) => {return(a[option_value] < b[option_value]) ? 1 : -1});
            }else{
                myLibrary.sort((a, b) => {return(a[option_value].toLowerCase() > b[option_value].toLowerCase()) ? 1 : -1});
            }
    
            render();
            localStorage.setItem('option_value', option_value);
        }
    }

    function convert_to_gray_scale_img(imgObj, imgWidth, imgHeight){
        var canvas = document.createElement('canvas');
        var canvasContext = canvas.getContext('2d');
         
        var imgW = imgWidth;
        var imgH = imgHeight;
        canvas.width = imgW;
        canvas.height = imgH;
         
        canvasContext.drawImage(imgObj, 0, 0);
        var imgPixels = canvasContext.getImageData(0, 0, imgW, imgH);
         
        for(var y = 0; y < imgPixels.height; y++){
            for(var x = 0; x < imgPixels.width; x++){
                var i = (y * 4) * imgPixels.width + x * 4;
                var avg = (imgPixels.data[i] + imgPixels.data[i + 1] + imgPixels.data[i + 2]) / 3;
                imgPixels.data[i] = avg; 
                imgPixels.data[i + 1] = avg; 
                imgPixels.data[i + 2] = avg;
            }
        }
        canvasContext.putImageData(imgPixels, 0, 0, 0, 0, imgPixels.width, imgPixels.height);
        return canvas.toDataURL();
    }


    return {blurBackground, 
            unBlurBackground,
            reset,
            convert_to_gray_scale_img,
            _create_book_element,
            addToMyLibrary,
            removeBookToLibrary,
            render,
            retrieve_data,
            update_book_progress,
            sort_book,
            getSelectedImgPath : () => selected_img_path,
            setSelectedImgPath : (newPath) => selected_img_path = newPath,
            getMyLibrary : () => myLibrary,
            setMyLibrary : (newLibrary) => myLibrary = newLibrary,
            getBookImgFileName : () => book_img_file_name,
            setBookImgFileName : (name) => book_img_file_name = name,
        };
}();


const Book_Info = function(){
    const more_info_container = document.querySelector('.book-info-container');
    const plus_page_read_btn = document.querySelector('.page_read_plus_btn');
    const minus_page_read_btn = document.querySelector('.page_read_minus_btn');
    const close_more_info_btn = document.querySelector('#close-form-btn');

    const edit_button = document.querySelector('.edit-btn');
    const remove_button = document.querySelector('.remove-btn');
    const cancel_button = document.querySelector('.cancel-book-form');

    let page_read;
    let total_page;
    let info_current_data = '';
    let info_current_index = '';
    
    function init(array, e){
        let index = array.indexOf(e.target);
        let current_data = Main_Library.getMyLibrary()[index];
        
    
        info_total_page = parseInt(current_data.total_page);
        info_page_read = parseInt(current_data.page_read);
        info_current_data = current_data;
        info_current_index = index
    
        show_book_info(info_current_data);
    }   

    function show_book_info(){
        Main_Library.blurBackground();
        more_info_container.style.display = 'flex';
        gsap.fromTo(".book-info-container", {opacity:0, y: 100}, {duration: 1, opacity:1, y: 0});
        render(info_current_data);

    }

    function render(current_data){
        let info_title = document.querySelector('#info-title');
        let data_field = document.querySelectorAll('.info-value');
        
        more_info_container.style.backgroundImage = `linear-gradient(to bottom, rgba(5, 5, 5, 0.7), rgba(0, 0, 0, 0.9)), 
        url('${current_data.book_cover}')`;
    
        info_title.textContent = current_data.title;
        data_field[0].textContent = current_data.author;
        data_field[1].textContent = current_data.genre;
        data_field[2].textContent = current_data.total_page;
        data_field[3].textContent = current_data.page_read;
    
        _render_page_read();
        _render_progress_bar();
    }

    function _render_page_read(operation){
        page_read = parseInt(info_current_data.page_read);
        total_page = parseInt(info_current_data.total_page);
    
        let info_page_read_field = document.querySelectorAll('.info-value')[3];
    
        if(page_read >= parseInt(0) && page_read <=  total_page){
            if(operation === 'add' && page_read < total_page){
                page_read += 1;
                info_current_data.page_read += 1;
            }else if(operation === 'minus' && page_read > parseInt(0)){
                page_read -= 1;
                info_current_data.page_read -= 1;
            }
    
            info_page_read_field.textContent = page_read;
            info_current_data['page_read'] = page_read;

            let current_book_progress_bar = document.querySelectorAll('.book > .progress-bar')[info_current_index];
            Main_Library.update_book_progress(info_current_data.page_read, info_current_data.total_page, current_book_progress_bar);
            _render_progress_bar();
        }
    }
    
    function _render_progress_bar(){
        let info_progress_bar = document.querySelector('.info-progress-bar');
        let info_status_value = document.querySelector('.info-status-value');

        if(page_read === 0){
            info_status_value.style.display = 'block';
            info_progress_bar.style.display = 'none';
        }else{
            info_progress_bar.style.display = 'block';
            info_status_value.style.display = 'none';
    
            let width = (page_read / total_page) * 100;
            info_progress_bar.style.setProperty('--info-progress-bar-width' , `${width}%`);
        }
        Main_Library.render();
    }

    function hide(){
        Main_Library.unBlurBackground();
        gsap.to(".book-info-container", {duration: 1, opacity:0, y: 1000});
        //more_info_container.style.display = 'none';
    }

    function _show_edit_form(){
        const img_url_field = document.querySelector('#img-url-input');
        const selected_img = document.getElementById('selected-img');
        const input_field = Book_Form.getFields();
        const book_obj_keys = Object.keys(info_current_data);

        let selected_img_path = info_current_data.book_cover;
        let img_file_name_text;

        for(let i = 0; i < input_field.length; i++){
            input_field[i].value = info_current_data[book_obj_keys[i]];
        }

        Main_Library.setSelectedImgPath(info_current_data.book_cover);

        if(selected_img_path.startsWith('http')){
            img_url_field.value = selected_img_path;
            selected_img.textContent = 'No file selected.';
        }else{
            (info_current_data.image_file_name === '') ? img_file_name_text = 'No file selected.' : img_file_name_text = info_current_data.image_file_name;
            selected_img.textContent = img_file_name_text;
            img_url_field.value = '';
        }

        hide();
        Book_Form.show_form('edit');
    }

    function remove_book(){
        Main_Library.removeBookToLibrary(info_current_index);
        hide();
    }

    function addEvent(){
        close_more_info_btn.addEventListener('click', hide, false);
        plus_page_read_btn.addEventListener('click', _render_page_read.bind(event,'add'),false);
        minus_page_read_btn.addEventListener('click', _render_page_read.bind(event, 'minus'),false);
        edit_button.addEventListener('click', _show_edit_form, false);
        remove_button.addEventListener('click', remove_book ,false);
        cancel_button.addEventListener('click', hide, false);
    }

    return {init,
            addEvent,
            render,
            show_book_info,
            getCurrentBookData : () => info_current_data,
            setCurrentBookData : (newData) => info_current_data = newData,
            setCurrentBookIndex : (newIndex) => info_current_index = newIndex,
            }
}();


const Search_Book = function(){
    const main_container = document.getElementById('main-container');

    function search(e){
        const result_container = document.querySelector('.results');
        result_container.innerHTML = '';

        let search_field = e.target;
        let search_value = search_field.value.toLowerCase().split(' ').join('');
        let results;
    
        let match_book = Main_Library.getMyLibrary().filter(book => {
            let book_title = book.title.toLowerCase().split(' ').join(''); //book title in lowercase form without whitespace
            let book_author = book.author.toLowerCase().split(' ').join(''); 
    
            return (book_title.startsWith(search_value) || book_author.startsWith(search_value)) && search_value != '';
        }); 
    
        match_book.forEach(book => {
            Main_Library._create_book_element(result_container, 'div', 'result', `<p class='result-title'>${book.title}</p>
            <p class='result-author'>${book.author}</p>`);  
        });
    
        if(!match_book.length && search_value != ''){
            Main_Library._create_book_element(result_container, 'div', 'result', `<p class='no-result'>Book's not found.</p>`);
        }else if(search_value === ''){
            result_container.innerHTML = ''; 
        }else{
            results = document.querySelectorAll('.result');
            results.forEach(result => {
                result.addEventListener('click', _result_data.bind(event, match_book, search_field),false);
            });
        }

        main_container.addEventListener('click', _resultSetToNone, false);
    }
    
    function _result_data(match_book, search_field, e){
        let text_value = e.target.textContent;
        let title;
        search_field.value = '';
    
        if(e.target.tagName === 'DIV'){
            title = text_value.split('\n')[0];
        }else if(e.target.tagName === 'P'){
            title = text_value;
        }
        
        let selected_data = match_book.filter(book => book.title === title || book.author === title)[0];
        
        _resultSetToNone();
        Book_Info.setCurrentBookData(selected_data);
        Book_Info.setCurrentBookIndex(Main_Library.getMyLibrary().indexOf(selected_data));
        Book_Info.show_book_info();
    }

    function _resultSetToNone(){
        document.querySelector('.results').innerHTML = ''; 
        document.querySelector('input[type="search"]').value = '';
        main_container.removeEventListener('click', _resultSetToNone, false);
    }

    return {search};
}();


const Book_Form = function(){
    const form_container = document.getElementById('book-form');
    const form_title = document.querySelector('#form-title');
    const form_inputs = Array.from(document.querySelectorAll('input[type="text"]'));
    const [title_field, author_field, genre_field, total_page_field, page_read_field] = form_inputs;
    const url_field = document.querySelector('#img-url-input');
    const imgGetFrom = document.querySelectorAll('.image-input-div input[type="radio"]')

    const page_count_checkbox = document.querySelector('#page-count-checkbox');
    const page_switch = document.querySelector('.read-switch');
    const img_url_field = document.querySelector('#img-url-input');
    const image_btn = document.getElementById('image-button');
    const image_input = document.getElementById('image-input');
    const selected_img = document.getElementById('selected-img');
    const submit_form_btn = document.getElementById('submit-form-btn');

    const close_form_btn = document.querySelector('.book-form #close-form-btn');
    const cancel_button = document.querySelector('.cancel-book-form');

    const error_field_color = 'red';
    const valid_field_color = 'green';
    const valid_input = {
        'title-input' : /^.{1,30}$/,
        'author-input' :  /^.{1,20}$/,
        'genre-input' :  /^.{1,15}$/,
        'total-page-input': /^[1-9](\d+)?$/,
        'img-url-input' : /^(http(s)?:\/\/.+)?$/,
    };
    

    function clear_field(){
        Main_Library.setSelectedImgPath('');
        Main_Library.setBookImgFileName('');
        imgGetFrom.forEach(radio => radio.checked = false);
        img_url_field.value = '';
        form_inputs.map(input => {
            input.value = '';
            input.style.borderColor = '#6E6E6E'
        });
    }

    function show_form(form_type){
        if(form_type === 'edit'){
            form_title.textContent = 'Edit Book';
            submit_form_btn.textContent = 'Save Changes';
            form_inputs.map(input => input.style.borderColor = valid_field_color);
            submit_form_btn.addEventListener('click', _save_changes,false);
            submit_form_btn.removeEventListener('click', submit_form_input_values, false);
        }else{
            form_title.textContent = 'Add New Book';
            submit_form_btn.innerHTML = '<i class="fa fa-plus" aria-hidden="true"></i>Add Book';
            submit_form_btn.addEventListener('click', submit_form_input_values, false);
            submit_form_btn.removeEventListener('click', _save_changes,false);
        }

        form_container.style.display = 'grid';
        gsap.fromTo(".book-form", {opacity:0, y: 1000}, {duration: 1, opacity:1, y: 0});
        Main_Library.blurBackground();
    }

    function show_add_book_form(){
        clear_field();
        show_form();

        page_read_field.disabled = true;
        page_count_checkbox.disabled = true;
        page_switch.disabled = true;
        page_count_checkbox.checked = false;
    }

    function hide(form_type){
        gsap.to(".book-form", {duration: 1, opacity:0, y: 1000});

        if(form_type === 'edit'){
            Book_Info.show_book_info();
        }

        url_field.style.display = 'none';
        image_btn.style.display = 'none';
        selected_img.style.display = 'none';

        clear_field();

        //form_container.style.display = 'none';
        Main_Library.unBlurBackground();
    }

    function _getInputToValidate(e){
        _validate(e.target, e.target.id);
    }

    
    function _validate(field, obj_key){
        let error_msg = field.nextSibling.nextElementSibling;
        
        function _page_input_state(page_switch_cursor, disabled_state){
            page_read_field.disabled = disabled_state;
            page_count_checkbox.disabled = disabled_state;
            page_switch.disabled = disabled_state;
            page_switch.style.cursor = page_switch_cursor;
        }

        if(field.id != 'page-read-input'){
            if(valid_input[obj_key].test(field.value) ){
                error_msg.classList.remove('show-error-msg');
                field.style.borderColor = valid_field_color;
            }else{
                field.style.borderColor = error_field_color;
                error_msg.classList.add('show-error-msg');
            }
        }

        if(field.id === 'total-page-input'){
            if(valid_input[obj_key].test(field.value)){
                if(field.value[0] !== '0'){
                    _page_input_state('pointer',disabled_state = false);
                }
                
            }else{
                _page_input_state('arrow',disabled_state = true);
            }
            _validate(page_read_field, 'page-read-input');
            return;
        }
    
        if(field.id === 'page-read-input'){    
            if(field.value == total_page_field.value){
                page_count_checkbox.checked= true;
            }else if(field.value != total_page_field.value){
                page_count_checkbox.checked = false;
            }
            
            if(field.value === '0' || (parseInt(field.value) <= parseInt(total_page_field.value) && valid_input['total-page-input'].test((field.value)))){
                error_msg.classList.remove('show-error-msg');
                field.style.borderColor = valid_field_color;
            }else{
                field.style.borderColor = error_field_color;
                error_msg.classList.add('show-error-msg');
            }
        }
    }

    function _page_count_toggle(){
        if(!page_switch.disabled){
            if(page_count_checkbox.checked){
                page_read_field.value = total_page_field.value;
            }else{
                page_read_field.value = '';
            }
            _validate(page_read_field, 'page-read-input');
        }
    }

    function _getImageFrom(e){  //radio button event in form
        let radio_value = e.target.value;
        let selected_img_path = Main_Library.getSelectedImgPath();
        
        if(radio_value === 'by_url'){
            if(selected_img_path.startsWith('http')){
                img_url_field.value = selected_img_path;
            }

            url_field.style.display = 'block';
            image_btn.style.display = 'none';
            selected_img.style.display = 'none';
        }else{
            img_url_field.value = '';
            url_field.style.display = 'none';
            image_btn.style.display = 'block';
            selected_img.style.display = 'block';
        }
    }

    function image_input_event(e){
        let chosen_img_obj = e.target.files[0];
        let image_filename = chosen_img_obj.name;

        selected_img.textContent = image_filename;
        Main_Library.setBookImgFileName(image_filename);
    
        var reader = new FileReader();  
        reader.readAsDataURL(chosen_img_obj);
    
        reader.onload = function(e) { 
            var img_data_url = e.target.result;
            Main_Library.setSelectedImgPath(img_data_url);
    
            if(parseInt(chosen_img_obj.size) >= 2300000){ //convert the local img if the img is greater than 2.3mb
                let img = new Image();
                img.src = Main_Library.getSelectedImgPath();
                img.onload = ()=> {
                    let gray_img = Main_Library.convert_to_gray_scale_img(img, img.width, img.height);
                    Main_Library.setSelectedImgPath(gray_img);
                }
            }
        };  
    }

    function submit_form_input_values(){
        let error_field = form_inputs.filter(input => {
            return (input.style.borderColor === error_field_color || input.value === '');
        });
        if(error_field.length) return;

        let book_exist = Main_Library.getMyLibrary().filter(book => book.title === title_field.value);
        if(book_exist.length > 0){
            alert("Book's already exists.");
            return;
        }

        try {   //Avoid  getting error if user didn't choose one of the radio button in the form
            if(document.querySelector("input[type=radio]:checked").value === 'by_url'){
                Main_Library.setSelectedImgPath(img_url_field.value);
            }
        } catch (TypeError) {}

        let book_info = new Book(title_field.value,
                                author_field.value,
                                genre_field.value,
                                total_page_field.value,
                                page_read_field.value,
                                Main_Library.getSelectedImgPath(),
                                Main_Library.getBookImgFileName(),
        );
        Main_Library.addToMyLibrary(book_info);
        hide();
        Main_Library.render();
        Library_Info.render();
    }

    function _save_changes(){
        let error_field = form_inputs.filter(input => {
            if(input.style.borderColor === 'red' || input.value === '') return true;
        });
        if(error_field.length > 0) return;
    
        try {
            if(document.querySelector("input[name=pic_get_from]:checked").value === 'by_url'){
                Main_Library.setSelectedImgPath(img_url_field.value);
                img_url_field.value = '';
            }
        } catch (TypeError) {}
    
        let current_book_data = Book_Info.getCurrentBookData();
        let obj_key = Object.keys(current_book_data);

        for(let i = 0; i < form_inputs.length; i++){
            current_book_data[obj_key[i]] = form_inputs[i].value;
        }

        current_book_data['book_cover'] = Main_Library.getSelectedImgPath();
        current_book_data['image_file_name'] = Main_Library.getBookImgFileName();

        Main_Library.render();
        Book_Info.render(current_book_data);
        hide('edit');
    }

    function addEvent(){
        close_form_btn.addEventListener('click', Book_Form.hide, false);
        page_switch.addEventListener('click', _page_count_toggle, false);

        imgGetFrom.forEach(radio => radio.addEventListener('click', _getImageFrom.bind(event), false));
        url_field.addEventListener('keyup', _getInputToValidate.bind(event) , false);

        image_btn.addEventListener('click', () => image_input.click()); //Trigger the function of hidden default input file btn
        image_input.addEventListener('change', image_input_event, false);
        submit_form_btn.addEventListener('click', submit_form_input_values, false);
        cancel_button.addEventListener('click', hide, false);

        form_inputs.forEach(input => {
            input.autocomplete = false;
            input.addEventListener("click", _getInputToValidate.bind(event) , false);
            input.addEventListener('keyup', _getInputToValidate.bind(event) , false);
        });
    }

    return {
                show_add_book_form, 
                show_form,
                hide,
                addEvent,
                getFields : () => form_inputs,
           };
}();


(function (){
    Library_Event.addEvent();
    Book_Form.addEvent();
    Book_Info.addEvent();
    Main_Library.retrieve_data();
    Library_Info.render();
})();
