'use strict';

const account1 = {
  owner: 'Idris',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2,
  pin: 1111,
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: 'Steven Thomas Williams',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: 'Sarah Smith',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

const accounts = [account1, account2, account3, account4];

const labelWelcome = document.querySelector('.welcome');
const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const btnLogin = document.querySelector('.login__btn');
const timerElement = document.querySelector('.timer');

let currentAccount, timer;

const displayMovements = function (movements) {
  containerMovements.innerHTML = '';

  movements.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${i + 1} ${type}</div>
        <div class="movements__date">3 days ago</div>
        <div class="movements__value">${mov}€</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};
let sorted = false;

// Sort button
document.querySelector('.btn--sort').addEventListener('click', function () {
  const sortedMovements = [...currentAccount.movements];

  if (!sorted) {
    sortedMovements.sort((a, b) => a - b);
    sorted = true;
  } else {
    sortedMovements.sort((a, b) => b - a);
    sorted = false;
  }

  displayMovements(sortedMovements);
});
const updateUI = function () {
  displayMovements(currentAccount.movements);

  const balance = currentAccount.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = `${balance}€`;

  const income = currentAccount.movements.filter(mov => mov > 0).reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = `${income}€`;

  const expenses = currentAccount.movements.filter(mov => mov < 0).reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = `${Math.abs(expenses)}€`;

  const interest = (income * currentAccount.interestRate) / 100;
  labelSumInterest.textContent = `${interest}€`;
};

const startLogoutTimer = function () {
  let time = 300; // 5 minutes in seconds

  const formatTime = function (seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  const updateTimer = function () {
    if (time > 0) {
      time--;
      timerElement.textContent = formatTime(time);
    } else {
      clearInterval(timer);
      // Implement logout logic here
      console.log('User logged out due to inactivity.');
      containerApp.style.opacity = 0;
    }
  };

  updateTimer();
  timer = setInterval(updateTimer, 1000);
};

btnLogin.addEventListener('click', function (e) {
  e.preventDefault(); // Sayfa yenileme işlemini durdur

  currentAccount = accounts.find(acc => acc.owner === inputLoginUsername.value);

  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    labelWelcome.textContent = `Welcome back, ${currentAccount.owner.split(' ')[0]}`;
    containerApp.style.opacity = 1;

    updateUI();
    startLogoutTimer();

    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();
  }
});

document.querySelector('.form--transfer').addEventListener('submit', function (e) {
  e.preventDefault();

  const transferTo = document.querySelector('.form__input--to').value;
  const transferAmount = Number(document.querySelector('.form__input--amount').value);

  if (transferTo && transferAmount > 0) {
    const receiverAccount = accounts.find(acc => acc.owner === transferTo);

    if (receiverAccount) {
      currentAccount.movements.push(-transferAmount);
      receiverAccount.movements.push(transferAmount);

      updateUI();
      startLogoutTimer();
    }
  }

  document.querySelector('.form--transfer').reset();
});

document.querySelector('.form--loan').addEventListener('submit', function (e) {
  e.preventDefault();

  const loanAmount = Number(document.querySelector('.form__input--loan-amount').value);

  // Koşul: Kullanıcı daha önce deposit ettiği tutarların en fazla 10 katı kadar loan talep edebilir.
  const maxLoanAmount = currentAccount.movements
    .filter(mov => mov > 0)
    .reduce((max, mov) => (mov > max ? mov : max), 0) * 10;

  if (loanAmount > 0 && loanAmount <= maxLoanAmount) {
    currentAccount.movements.push(loanAmount);

    updateUI();
    startLogoutTimer();
  }

  document.querySelector('.form--loan').reset();
});

document.querySelector('.form--close').addEventListener('submit', function (e) {
  e.preventDefault();

  const confirmUser = document.querySelector('.form__input--user').value;
  const confirmPIN = Number(document.querySelector('.form__input--pin').value);

  if (confirmUser === currentAccount.owner && confirmPIN === currentAccount.pin) {
    const index = accounts.findIndex(acc => acc.owner === confirmUser);

    if (index !== -1) {
      accounts.splice(index, 1);
      containerApp.style.opacity = 0;
      labelWelcome.textContent = 'Log in to get started';
    }
  }

  document.querySelector('.form--close').reset();
});
