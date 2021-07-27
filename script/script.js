let form_container = document.getElementById('book-form');
let main_container = document.getElementById('main-container');
let show_form_btn = document.getElementById('show-form-btn');

let book_collection = document.getElementById("book-collection");

//Form input
let form_inputs = Array.from(document.querySelectorAll('input[type="text"]'));
let title_input = form_inputs[0];
let author_input = form_inputs[1];
let genre_input = form_inputs[2];
let total_page_input = form_inputs[3];
let remaining_page_input = form_inputs[4];

let page_count_checkbox = document.querySelector('#page-count-checkbox');
let page_switch = document.querySelector('.read-switch');

let image_btn = document.getElementById('image-button');
let image_input = document.getElementById('image-input');
let selected_img = document.getElementById('selected-img');
let submit_form_btn = document.getElementById('submit-form-btn');

let myLibrary;
let selected_img_path;
let book_img_file_name;

let valid_input = {
    'title' : /^.{1,30}$/,
    'author' :  /^.{1,20}$/,
    'genre' :  /^.{1,15}$/,
    'total_page': /^[1-9](\d+)?$/,
};

function main(){
    clear_input_field();
    retrieve_data();
    form_inputs_events();
    show_form_btn.addEventListener('click', show_form);
    page_switch.addEventListener('click', page_count_toggle);
    image_btn.addEventListener('click', () => image_input.click());
    image_input.addEventListener('change', image_input_event, false);
    submit_form_btn.addEventListener('click', submit_form_input_values);
}

function Book(title,author,genre,total_page, page_read, book_img, img_file_name){
    this.title = title;
    this.author = author;
    this.genre = genre;
    this.total_page = total_page;
    this.page_read = page_read;
    this.book_img = book_img;
    this.image_file_name = img_file_name;
}

function clear_input_field(){
    title_input.value = '';
    author_input.value = '';
    genre_input.value = '';
    total_page_input.value = '';
    remaining_page_input.value = '';
    selected_img_path = '';
    book_img_file_name = '';
    selected_img.textContent = "No file selected."
}

function show_form(){
    main_container.style.filter = "blur(8px)";
    form_container.setAttribute('style', 'top:calc((100% - 40em)/2); transition: 1s;');
    

    remaining_page_input.disabled = true;
    page_count_checkbox.disabled = true;
    page_switch.disabled = true;

    page_count_checkbox.checked = false;
}

function hideForm(){
    main_container.style.filter = "blur(0px)";
    main_container.disabled = false;
    form_container.style.top = '150vh';
}


function page_count_toggle(){
    if(!page_switch.disabled){
        if(page_count_checkbox.checked){
            remaining_page_input.value = total_page_input.value;
        }else{
            remaining_page_input.value = '';
        }
        validate(remaining_page_input, 'remaining_page');
    }
}


function image_input_event(e){
    let image_path = e.explicitOriginalTarget.value;
    let image_file = image_path.split('\\')[2];
    selected_img.textContent = image_file;
    book_img_file_name = image_file;

    
    var reader = new FileReader();  
    reader.readAsDataURL(e.target.files[0])

    reader.onload = function(e) { 
        var img_data_url = e.target.result;
        selected_img_path = img_data_url;
    };  
}


function form_inputs_events(){
    form_inputs.forEach(input => {
        input.autocomplete = false;
        input.addEventListener("click", form_event_func, false);
        input.addEventListener('keyup', form_event_func,false);
    });
}


function form_event_func(e){
    let input_obj_prop;
    switch(e.target.id){
        case 'title-input':
            input_obj_prop = 'title';
            break;

        case 'author-input':
            input_obj_prop = 'author';
            break;

        case 'genre-input':
            input_obj_prop = 'genre';
            break;

        case 'total-page-input':
            input_obj_prop = 'total_page';
            break;

        case 'remaining-page-input':
            input_obj_prop = 'remaining_page';
            break;
    }
    validate(e.target, input_obj_prop);
}


function validate(field, obj_input_attr){
    let error_msg = field.nextSibling.nextElementSibling;
    if(obj_input_attr != 'remaining_page'){
        if(valid_input[obj_input_attr].test(field.value) ){
            error_msg.classList.remove('show-error-msg');
            field.style.borderColor = 'green';
        }else{
            field.style.borderColor = 'red';
            error_msg.classList.add('show-error-msg');
        }
    }

    if(obj_input_attr === 'total_page'){
        if(valid_input[obj_input_attr].test(field.value)){
            if(field.value[0] !== '0'){
                remaining_page_input.disabled = false;
                page_count_checkbox.disabled = false;
                page_switch.disabled = false;
                page_switch.style.cursor = 'pointer';
            }
            
        }else{
            remaining_page_input.disabled = true;
            page_count_checkbox.disabled = true;
            page_switch.disabled = true;
            page_switch.style.cursor = 'arrow';
        }
        return;
    }

    if(obj_input_attr === 'remaining_page'){    
        if(field.value == total_page_input.value){
            page_count_checkbox.checked= true;
        }else if(field.value != total_page_input.value){
            page_count_checkbox.checked = false;
        }
        
        if(field.value === '0' || (parseInt(field.value) <= parseInt(total_page_input.value) && valid_input['total_page'].test((field.value)))){
            error_msg.classList.remove('show-error-msg');
            field.style.borderColor = 'green';
        }else{
            field.style.borderColor = 'red';
            error_msg.classList.add('show-error-msg');
        }
    }
}


function submit_form_input_values(){
    let error_field = form_inputs.filter(input => {
        if(input.style.borderColor === 'red' || input.value === '') return 'invalid field';
    });
    if(error_field.length > 0) return;

    form_inputs.map(input => input.style.borderColor = '#6E6E6E');
    hideForm();
    book_collection.innerHTML = '';

    let book_info = new Book(title_input.value,
                             author_input.value,
                             genre_input.value,
                             total_page_input.value,
                             remaining_page_input.value,
                             selected_img_path,
                             book_img_file_name,
    );
    
    myLibrary.push(book_info);

    add_data_to_LocalStorage();
    display_book();
    clear_input_field();
}

function add_data_to_LocalStorage(){
    localStorage.setItem('books_collection', JSON.stringify(myLibrary));
}

function retrieve_data(){
    if(localStorage.length){
        empty_book_collection_title = document.querySelector('.book-collection > h2');
        empty_book_collection_title.style.display = 'none';

        var datas = JSON.parse(localStorage["books_collection"]);
        myLibrary = datas;
        display_book();
    }else{
        myLibrary = [];
    }
}


function display_book(){
    myLibrary.forEach((book)=>{
        let book_parent_tag = document.createElement('div');
        book_parent_tag.classList.add("book");
        book_collection.appendChild(book_parent_tag);

        create_book_element(parent = book_parent_tag, tag = 'img', _class = 'book-cover', content='', img_source = book.book_img);
        create_book_element(parent = book_parent_tag, tag = 'h4', _class = 'book-title', content = book.title);
        create_book_element(parent = book_parent_tag, tag = 'p', _class = 'author', content = `<em>${book.author}</em>`);
        create_book_element(parent = book_parent_tag, tag = 'div', _class = 'progress-bar', content = '');
        create_book_element(parent = book_parent_tag, tag = 'p', _class = 'page-count', content = `Pages: ${book.page_read}/${book.total_page}`);

        
        let color_progress_bars = document.querySelectorAll('.progress-bar');
        let current_progress_bar = color_progress_bars[color_progress_bars.length - 1]; 
        let width = (parseInt(book.page_read) / parseInt(book.total_page)) * 100;
        current_progress_bar.style.setProperty('--progress-bar-width' , `${width}%`);


        let book_parents = document.querySelectorAll('.book');
        let book_covers = document.querySelectorAll('.book-cover');
        let titles = document.querySelectorAll(".book-title");

        let current_book_parent = book_parents[book_parents.length - 1];
        let current_book_cover = book_covers[book_covers.length-1];        
        let current_title = titles[titles.length - 1];

        let title_length = current_title.textContent.length;
        let front_word = current_title.textContent.substring(0, 14);

        if(book.book_img === undefined || book.book_img === ''){
            current_book_parent.removeChild(current_book_cover);
            current_title.classList.add('center-title');

            if(title_length > 13 && !(/ /.test(front_word.slice(9,14)))){
                let back_word = current_title.textContent.substring(14, title_length);
                current_title.textContent = `${front_word} ${back_word}`;
            }
            return;
        }

        if(title_length > 13){
            cut_title = front_word.replace(/(...)$/, '...');
            current_title.textContent = cut_title;
        }
    });
}

function create_book_element(parent, tag, _class, content, img_source){
    let child = document.createElement(tag);
    child.classList.add(_class);
    child.innerHTML = content;
    parent.appendChild(child);

    if(tag == 'img') {
        child.src = img_source;
    }
}


window.addEventListener('load', main, false);

