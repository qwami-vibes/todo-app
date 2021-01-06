let form = document.querySelector('form');
let deleteBtn = document.querySelectorAll('.btn-danger');
let author = document.querySelector('#input-author');
let title = document.querySelector('#input-title');
let subBtn = document.querySelector('.btn-submit');
let table = document.querySelector('tbody');
let trs = document.querySelectorAll('.table__row');
let nav = document.querySelector('nav');
let main = document.querySelector('main');
let modeIcon = document.querySelector('.nav__icon');
let modeIconSvg = document.querySelector('.nav__icon--svg');
let lightmode = 'assets/icons/sprite.svg#sunny-o';
let darkmode = 'assets/icons/sprite.svg#moon';

//Collection of data from firestore as a real listener

const fireCheck = db.collection('todos').onSnapshot(snap => {
    snap.docChanges().forEach(change => {
        console.log(change);
        const doc = change.doc;
        if (change.type === 'added') {
            updateUI(doc.data().author, doc.data().title, doc.data().created.toDate().toLocaleString(), doc.id);
        }
        else if (change.type === 'removed') {
            removeUI(doc.id);
        };
    });
});

let checkSubBtn = () => {
    if(author.value && title.value) {
        subBtn.classList.remove('disabled');
        subBtn.disabled = false;
    } else {
        subBtn.classList.add('disabled');
        subBtn.disabled = true;
    }
};

let sendAlert = type => {
    let ele = document.createElement('div');
    let addText = document.createTextNode('todo added successfully to database');
    let delText = document.createTextNode('todo deleted successfully from database');

    if(type === 'added') {
        ele.appendChild(addText);
        ele.classList.add('alert', 'alert-success', 'alert-visible');
        nav.appendChild(ele);
        removeAlert(ele);
    } else if(type === 'removed') {
        ele.appendChild(delText);
        ele.classList.add('alert', 'alert-danger', 'alert-visible');
        nav.appendChild(ele);
        removeAlert(ele);
    }
};

let removeAlert = ele => {
    setTimeout(() => {
        ele.remove();
    }, 4000);
}

let addTodo = todo => {
    db.collection('todos').add(todo).then(() => {
        sendAlert('added');
    }).catch(err => {
        console.log(err)
    });
};

let delTodo = id => {
    db.collection('todos').doc(id).delete().then(() => {
        sendAlert('removed');
    }).catch(err => {
        console.log(err);
    })
};

let addColor = trs => {
    trs.forEach(tr => {
        if(tr.classList.contains('table-row-added')) {
            setTimeout(() => {
                tr.classList.remove('table-row-added');
            }, 1500);
            changeMode(localStorage.getItem('mode'));
        } else if(tr.classList.contains('table-row-removed')) {
            setTimeout(() => {
                tr.classList.remove('table-row-removed');
            }, 1500);
            changeMode(localStorage.getItem('mode'));
        };
    });
}

let updateUI = (auth, title, date, id) => {
    let snip = `
    <tr class="table__row table-row-added" data-id=${id}>
        <td>${auth}</td>
        <td>${title}</td>
        <td>${date}</td>
        <td>
            <button class="btn btn-danger btn-hide">delete</button>
        </td>
    </tr>
    `
    table.innerHTML += snip;
    let trs = document.querySelectorAll('.table__row');
    addColor(trs);
    recheck(trs);
}

let removeUI = id => {
    let trs = document.querySelectorAll('.table__row');
    trs.forEach(tr => {
        if(tr.getAttribute('data-id') === id) {
            tr.classList.add('table-row-removed');
            addColor(trs);
            setTimeout(() => {
                tr.remove();
            }, 2000);
        }
    });
};

let changeIcon = () => {
    if(modeIconSvg.getAttribute('xlink:href') === darkmode) {
        modeIconSvg.setAttribute('xlink:href', lightmode);
        storeMode(darkmode);
        changeMode(darkmode);
    } else if(modeIconSvg.getAttribute('xlink:href') === lightmode) {
        modeIconSvg.setAttribute('xlink:href', darkmode);
        storeMode(lightmode);
        changeMode(lightmode);
    }
}

let storeMode = mode => {
    localStorage.setItem('mode', mode);
};

let changeMode = mode => {
    let trs = document.querySelectorAll('.table__row');
    let inputAuthor = form.author;
    let inputTitle = form.title;
     if(mode === lightmode) {
        trs.forEach(tr => {
            tr.style.color = '#2d2d2d';
            tr.classList.remove('tr-darkmode');
        });
        main.style.backgroundColor = '#fff';
        inputAuthor.classList.remove('form__groups--darkmode');
        inputTitle.classList.remove('form__groups--darkmode');
    } else if(mode === darkmode) {
        trs.forEach(tr => {
            tr.style.color = '#e7e8eb';
            tr.classList.add('tr-darkmode');
        });
        main.style.backgroundColor = '#2d2d2d';
        inputAuthor.classList.add('form__groups--darkmode');
        inputTitle.classList.add('form__groups--darkmode');
     };
};

let recheck = trs => {
    trs.forEach(tr => {
        tr.addEventListener('mouseover', () => {
            let btnDel = tr.lastElementChild.firstElementChild;
            btnDel.classList.replace('btn-hide', 'btn-show');
        });

        tr.addEventListener('mouseleave', () => {
            let btnDel = tr.lastElementChild.firstElementChild;
            btnDel.classList.replace('btn-show', 'btn-hide');
        });
    });

    trs.forEach(tr => {
        tr.addEventListener('click', e => {
            let id = e.target.parentElement.parentElement.getAttribute('data-id');
            delTodo(id);
        });
    });
};

form.addEventListener('keyup', () => {
    checkSubBtn();
});

form.addEventListener('submit', e => {
    e.preventDefault();
    const now = new Date();
    let todo = {
        author : form.author.value.trim().toLowerCase(),
        title : form.title.value.trim().toLowerCase(),
        created : firebase.firestore.Timestamp.fromDate(now)
    };
    changeMode(localStorage.getItem('mode'));
    addTodo(todo);
    console.log(todo);
    form.reset();
    form.author.focus();

});

modeIcon.addEventListener('click', () => changeIcon());

if(localStorage.getItem('mode')) {
    if(localStorage.getItem('mode') === lightmode) {
        modeIconSvg.setAttribute('xlink:href', darkmode);
        changeMode(lightmode)
    } else if(localStorage.getItem('mode') === darkmode) {
        modeIconSvg.setAttribute('xlink:href', lightmode);
        changeMode(darkmode);
    }
};