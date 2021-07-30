let form_container = document.getElementById('book-form');
let main_container = document.getElementById('main-container');
let show_form_btn = document.getElementById('show-form-btn');

let book_collection = document.getElementById("book-collection");
let empty_book_collection_title = document.querySelector('.book-collection > h2');

//Form input
let form_title = document.querySelector('#form-title');
let form_inputs = Array.from(document.querySelectorAll('input[type="text"]'));
let title_input = form_inputs[0];
let author_input = form_inputs[1];
let genre_input = form_inputs[2];
let total_page_input = form_inputs[3];
let page_read_input = form_inputs[4];

let close_form_btn = document.querySelector('.book-form #close-form-btn');
let page_count_checkbox = document.querySelector('#page-count-checkbox');
let page_switch = document.querySelector('.read-switch');

let image_btn = document.getElementById('image-button');
let image_input = document.getElementById('image-input');
let selected_img = document.getElementById('selected-img');
let submit_form_btn = document.getElementById('submit-form-btn');

let more_info_container = document.querySelector('.book-info-container');
let plus_page_read_btn = document.querySelector('.page_read_plus_btn');
let minus_page_read_btn = document.querySelector('.page_read_minus_btn');
let info_total_page;
let info_page_read;
let info_page_read_field;
let info_current_data;
let info_current_index;

let current_book_cover;
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
    set_library_info();
    form_inputs_events();

    if(localStorage.books_collection === '[]'){
        create_book_element(book_collection, 'h2', 'empty-book-title', 'Create New Book Now');
    }

    show_form_btn.addEventListener('click', show_add_book_form);
    close_form_btn.addEventListener('click', hideForm.bind(event, form_container),false)
    page_switch.addEventListener('click', page_count_toggle);
    image_btn.addEventListener('click', () => image_input.click());
    image_input.addEventListener('change', image_input_event, false);
    submit_form_btn.addEventListener('click', submit_form_input_values);

    document.querySelector('.book-info-container #close-form-btn').addEventListener('click', hideForm.bind(event, more_info_container),false);
    plus_page_read_btn.addEventListener('click', set_info_progress_bar_status.bind(event, 'add'),false)
    minus_page_read_btn.addEventListener('click', set_info_progress_bar_status.bind(event, 'minus'),false)
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

function set_library_info(){
    let field_value = document.querySelectorAll('.info-library-subtitles + p');

    let total_books = myLibrary.length;
    let books_completed = myLibrary.filter(book => book.total_page === book.page_read).length;
    let total_pages = myLibrary.reduce((total, book) => { return total + parseInt(book.total_page)},0);
    let page_completed = myLibrary.reduce((total, book) => {return total + parseInt(book.page_read)},0);
    let remaining_page = total_pages - page_completed;

    field_value[0].textContent = total_books;
    field_value[1].textContent = books_completed;
    field_value[2].textContent = total_pages;
    field_value[3].textContent = page_completed;
    field_value[4].textContent = remaining_page;
}

function left_frame_display(btn){
    const frame = document.querySelector('.left-frame');
    const frame_display_btn = document.querySelector('.hide-library-info-btn > p');

    if(frame_display_btn.textContent === '<'){
        frame.setAttribute('style', 'transform: translateX(-100%); transition: 1s');
        book_collection.setAttribute('style', 'transform: translateX(-13%); transition: 1s');
        frame_display_btn.textContent = '>'
    }else if(frame_display_btn.textContent === '>'){
        frame.setAttribute('style', 'transform: translateX(00%); transition: 1s');
        book_collection.setAttribute('style', 'transform: translateX(0%); transition: 1s');
        frame_display_btn.textContent = '<'
    }
}
function clear_input_field(){
    title_input.value = '';
    author_input.value = '';
    genre_input.value = '';
    total_page_input.value = '';
    page_read_input.value = '';
    selected_img_path = '';
    book_img_file_name = '';
    selected_img.textContent = "No file selected.";
    form_inputs.map(input => input.style.borderColor = '#6E6E6E');
}

function show_form(form_type){
    if(form_type === 'edit book'){
        more_info_container.style.top = '150vh';
    }

    form_container.setAttribute('style', 'top:calc((100% - 40em)/2); transition: 1s;');
    main_container.style.filter = "blur(8px)";

}

function show_add_book_form(){
    clear_input_field();
    show_form();

    form_title.textContent = 'Add New Book';
    submit_form_btn.innerHTML = '<i class="fa fa-plus" aria-hidden="true"></i>  Add Book';
    submit_form_btn.removeEventListener('click',submit_form_changes);
    submit_form_btn.addEventListener('click', submit_form_input_values, false);
    
    page_read_input.disabled = true;
    page_count_checkbox.disabled = true;
    page_switch.disabled = true;
    page_count_checkbox.checked = false;
}

function hideForm(container){
    if(container === form_container){
        if(submit_form_btn.textContent ==='Save Changes'){
            show_book_info();
        }
    }
    main_container.style.filter = "blur(0px)";
    container.style.top = '150vh';
}


function page_count_toggle(){
    if(!page_switch.disabled){
        if(page_count_checkbox.checked){
            page_read_input.value = total_page_input.value;
        }else{
            page_read_input.value = '';
        }
        validate(page_read_input, 'page_read_key');
    }
}


function image_input_event(e){
    let img_file = e.target.files[0];
    let image_filename = img_file.name;
    selected_img.textContent = image_filename;
    book_img_file_name = image_filename;

    var reader = new FileReader();  
    reader.readAsDataURL(e.target.files[0]);

    reader.onload = function(e) { 
        var img_data_url = e.target.result;
        selected_img_path = img_data_url;

        if(parseInt(img_file.size) >= 2300000){
            let img = new Image();
            img.src = selected_img_path;
            img.onload = ()=> {
                let gray_img = convert_to_gray_scale_img(img, img.width, img.height);
                selected_img_path = gray_img;
            }
        }
    };  
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

        case 'page-read-input':
            input_obj_prop = 'page_read_key';
            break;
    }
    validate(e.target, input_obj_prop);
}


function validate(field, obj_input_attr){
    let error_msg = field.nextSibling.nextElementSibling;
    if(obj_input_attr != 'page_read_key'){
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
                page_read_input.disabled = false;
                page_count_checkbox.disabled = false;
                page_switch.disabled = false;
                page_switch.style.cursor = 'pointer';
            }
            
        }else{
            page_read_input.disabled = true;
            page_count_checkbox.disabled = true;
            page_switch.disabled = true;
            page_switch.style.cursor = 'arrow';
        }
        validate(page_read_input, 'page_read_key');
        return;
    }

    if(obj_input_attr === 'page_read_key'){    
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
    hideForm(form_container);
    book_collection.innerHTML = '';

    let book_info = new Book(title_input.value,
                             author_input.value,
                             genre_input.value,
                             total_page_input.value,
                             page_read_input.value,
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
    set_library_info();
}

function retrieve_data(){
    if(localStorage.books_collection.length){
        if(localStorage.option_value){
            document.querySelector('#sort').value = localStorage.getItem('option_value');
        }

        empty_book_collection_title.style.display = 'none';
        var datas = JSON.parse(localStorage["books_collection"]);
        myLibrary = datas;
        display_book();
    }else if(localStorage.books_collection === '[]'){
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
        create_book_element(parent = book_parent_tag, tag = 'div', _class = 'more-info', content = 'i');

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

        if(book.book_img === undefined || book.book_img === ''){
            current_book_parent.removeChild(current_book_cover);
            current_title.classList.add('center-title');
            return;
        }

        if(title_length > 12){
            cut_title = front_word.replace(/(...)$/, '...');
            current_title.textContent = cut_title;
        }
    });

    let more_info_btns = Array.from(document.querySelectorAll('.more-info'));
    let books = Array.from(document.querySelectorAll('.book'));

    more_info_btns.forEach(btn => btn.addEventListener('click', set_book_info.bind(event, more_info_btns), false));
    //books.forEach(book => book.addEventListener('click', set_book_info.bind(event, books), true));
}

function remove_all_book(){
    myLibrary.splice(0, myLibrary.length);
    display_book();
    add_data_to_LocalStorage();
}

function update_book_progress(page_read, total_page, progress_bar){
    let width = (parseInt(page_read) / parseInt(total_page)) * 100;
    progress_bar.style.setProperty('--progress-bar-width' , `${width}%`);
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

function show_book_info(){
    main_container.style.filter = "blur(8px)";
    more_info_container.setAttribute('style', 'top:calc((100vh - 45em)/2); transition: 1s;');
    display_current_book_data(info_current_data);
}

function set_book_info(array, e){
    let index = array.indexOf(e.target);
    let current_data = myLibrary[index];
    let data_field = document.querySelectorAll('.info-value');

    info_total_page = parseInt(current_data.total_page);
    info_page_read = parseInt(current_data.page_read);
    info_page_read_field = data_field[3];
    info_current_data = current_data;
    info_current_index = index

    show_book_info();
}   

function display_current_book_data(current_data){
    let info_title = document.querySelector('#info-title');
    let data_field = document.querySelectorAll('.info-value');
    
    more_info_container.style.backgroundImage = `linear-gradient(to bottom, rgba(5, 5, 5, 0.7), rgba(0, 0, 0, 0.9)), 
    url('${current_data.book_img}')`;

    info_title.textContent = current_data.title;
    data_field[0].textContent = current_data.author;
    data_field[1].textContent = current_data.genre;
    data_field[2].textContent = current_data.total_page;
    data_field[3].textContent = current_data.page_read;

    set_info_progress_bar_status(operation = '');
}

function remove_book_info(){
    myLibrary.splice(info_current_index,1);
    add_data_to_LocalStorage();
    book_collection.innerHTML = '';
    display_book();
    hideForm(more_info_container);

    if(myLibrary.length === 0){
        create_book_element(book_collection, 'h2', 'empty-book-title', 'Create New Book Now');
    }
    
}

function edit_book_info(){
    show_form('edit book');
    
    let img_file_name_text;
    form_title.textContent = 'Edit Book';

    title_input.value = info_current_data.title;
    author_input.value = info_current_data.author;
    genre_input.value = info_current_data.genre;
    total_page_input.value = info_current_data.total_page;
    page_read_input.value = info_current_data.page_read;
    selected_img_path = info_current_data.book_img;

    (info_current_data.image_file_name === '') ? img_file_name_text = 'No file selected.' : img_file_name_text = info_current_data.image_file_name;
    selected_img.textContent = img_file_name_text;

    form_inputs.map(input => input.style.borderColor = 'green');
    submit_form_btn.textContent = 'Save Changes';
    submit_form_btn.removeEventListener('click', submit_form_input_values);
    submit_form_btn.addEventListener('click', submit_form_changes, false);

}

function submit_form_changes(){
    let error_field = form_inputs.filter(input => {
        if(input.style.borderColor === 'red' || input.value === '') return true;
    });
    if(error_field.length > 0) return;

    more_info_container.setAttribute('style', 'top:calc((100vh - 45em)/2); transition: 1s;');
    form_container.setAttribute('style', 'top:150vh; transition: 1s;');

    let current_book_data = info_current_data;
    current_book_data['title'] = title_input.value;
    current_book_data['author'] = author_input.value;
    current_book_data['genre'] = genre_input.value;
    current_book_data['total_page'] = total_page_input.value;
    current_book_data['page_read'] = page_read_input.value;
    current_book_data['book_img'] = selected_img_path;
    current_book_data['image_file_name'] = book_img_file_name;

    add_data_to_LocalStorage();
    display_current_book_data(info_current_data);
    book_collection.innerHTML = '';
    display_book();
}

function set_info_progress_bar_status(operation){
    let book_page_count = document.querySelectorAll('.page-count')[info_current_index];
    let info_progress_bar = document.querySelector('.info-progress-bar');
    let info_status_value = document.querySelector('.info-status-value');
    let page_read = parseInt(info_current_data.page_read);
    let total_page = parseInt(info_current_data.total_page);

    if(page_read >= parseInt(0) && page_read <=  total_page && operation != ''){
        if(operation === 'add' && page_read < total_page){
            page_read += 1;
            info_current_data.page_read += 1;
        }else if(operation === 'minus' && page_read > parseInt(0)){
            page_read -= 1;
            info_current_data.page_read -= 1;
        }

        info_page_read_field.textContent = page_read;
        book_page_count.textContent = `Pages: ${page_read}/${total_page}`;
        info_current_data['page_read'] = page_read;
        add_data_to_LocalStorage();

        let current_book_progress_bar = document.querySelectorAll('.book > .progress-bar')[info_current_index];
        update_book_progress(info_current_data.page_read, info_current_data.total_page, current_book_progress_bar);
    }

    if(page_read === 0){
        info_status_value.style.display = 'block';
        info_progress_bar.style.display = 'none';
    }else{
        info_progress_bar.style.display = 'block';
        info_status_value.style.display = 'none';

        let width = (page_read / total_page) * 100;
        info_progress_bar.style.setProperty('--info-progress-bar-width' , `${width}%`);
    }
}

function sort_book(select){
    option_value = select.value;
    if(myLibrary.length && option_value != ''){
        if(option_value === 'total_page' || option_value === 'page_read'){
            myLibrary.sort((a, b) => {return(a[option_value].toLowerCase() < b[option_value].toLowerCase()) ? 1 : -1});
        }else{
            myLibrary.sort((a, b) => {return(a[option_value].toLowerCase() > b[option_value].toLowerCase()) ? 1 : -1});
        }

        book_collection.innerHTML = '';
        display_book();
        add_data_to_LocalStorage();
        localStorage.setItem('option_value', option_value);
    }
}

window.addEventListener('load', main, false);

