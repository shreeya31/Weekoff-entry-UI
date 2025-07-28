document.addEventListener('DOMContentLoaded', () => {
    const calendarGrid = document.getElementById('calendarGrid');
    const halfDayToggle = document.getElementById('halfDayToggle');
    const saveButton = document.getElementById('saveButton');

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const weeks = ['all', '1st', '2nd', '3rd', '4th', '5th'];

    // --- 1. GENERATE HEADER ROW ---
    const headerCellClasses = 'font-semibold text-slate-600 bg-slate-100 p-2 border-b-2 border-r border-slate-200 flex items-center justify-center';
    calendarGrid.innerHTML += `<div class="${headerCellClasses}"></div>`;
    weeks.forEach(week => {
        const headerCell = document.createElement('div');
        headerCell.className = headerCellClasses;
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'header-checkbox h-5 w-5 text-sky-600 rounded border-slate-300 focus:ring-sky-500';
        checkbox.dataset.headerWeek = week;
        const label = document.createElement('span');
        label.className = 'ml-2';
        label.textContent = week.charAt(0).toUpperCase() + week.slice(1);
        headerCell.appendChild(checkbox);
        headerCell.appendChild(label);
        calendarGrid.appendChild(headerCell);
    });

    // --- 2. GENERATE DATA ROWS ---
    days.forEach((day, dayIndex) => {
        let rowBgClass = dayIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50';
        if (day === 'Saturday' || day === 'Sunday') {
            rowBgClass = 'bg-sky-50';
        }
        const dayLabel = document.createElement('div');
        dayLabel.className = `font-medium text-slate-800 text-left self-stretch p-2 border-b border-r border-slate-200 flex items-center ${rowBgClass}`;
        dayLabel.textContent = day;
        calendarGrid.appendChild(dayLabel);
        weeks.forEach((week) => {
            const cell = document.createElement('div');
            cell.className = `flex items-center justify-center p-2 border-b border-r border-slate-200 ${rowBgClass}`;
            cell.dataset.day = day.toLowerCase();
            cell.dataset.week = week;

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'form-checkbox h-5 w-5 text-sky-600 rounded border-slate-300 focus:ring-sky-500 calendar-checkbox';
            if (day === 'Saturday' && week !== 'all') checkbox.checked = true;
            
            const dropdownWrapper = document.createElement('div');
            dropdownWrapper.className = 'relative w-full hidden calendar-dropdown';
            dropdownWrapper.innerHTML = `
                <button type="button" class="dropdown-toggle w-full bg-white border border-slate-300 rounded-md shadow-sm pl-3 pr-2 py-1.5 text-left text-sm font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-sky-500 flex justify-between items-center">
                    <span class="dropdown-label">Full Day</span>
                    <svg class="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
                </button>
                <div class="dropdown-menu hidden absolute z-10 mt-1 w-full bg-white shadow-lg border border-slate-300 rounded-md">
                    <a href="#" class="dropdown-item text-slate-700 block px-3 py-2 text-sm hover:bg-slate-100">Full Day</a>
                    <a href="#" class="dropdown-item text-slate-700 block px-3 py-2 text-sm hover:bg-slate-100">1st Half</a>
                    <a href="#" class="dropdown-item text-slate-700 block px-3 py-2 text-sm hover:bg-slate-100">2nd Half</a>
                </div>
            `;
            cell.appendChild(checkbox);
            cell.appendChild(dropdownWrapper);
            calendarGrid.appendChild(cell);
        });
    });

    // --- 3. EVENT LISTENERS ---
    halfDayToggle.addEventListener('change', (e) => {
        const isChecked = e.target.checked;
        document.querySelectorAll('.calendar-checkbox, .header-checkbox').forEach(cb => cb.classList.toggle('hidden', isChecked));
        document.querySelectorAll('.calendar-dropdown').forEach(dd => dd.classList.toggle('hidden', !isChecked));
    });

    calendarGrid.addEventListener('change', (e) => {
        const targetCheckbox = e.target;
        if (targetCheckbox.classList.contains('header-checkbox')) {
            const weekToToggle = targetCheckbox.dataset.headerWeek;
            const isChecked = targetCheckbox.checked;
            if (weekToToggle === 'all') {
                document.querySelectorAll('.calendar-checkbox, .header-checkbox').forEach(cb => cb.checked = isChecked);
            } else {
                document.querySelectorAll(`[data-week="${weekToToggle}"] .calendar-checkbox`).forEach(cb => cb.checked = isChecked);
            }
        }
        if (targetCheckbox.classList.contains('calendar-checkbox') && targetCheckbox.dataset.week === 'all') {
            document.querySelectorAll(`[data-day="${targetCheckbox.parentElement.dataset.day}"] .calendar-checkbox`).forEach(cb => cb.checked = targetCheckbox.checked);
        }
    });

    calendarGrid.addEventListener('click', (e) => {
        const toggle = e.target.closest('.dropdown-toggle');
        if (toggle) {
            const menu = toggle.nextElementSibling;
            document.querySelectorAll('.dropdown-menu').forEach(m => {
                if (m !== menu) m.classList.add('hidden');
            });
            menu.classList.toggle('hidden');
        }
        const item = e.target.closest('.dropdown-item');
        if (item) {
            e.preventDefault();
            item.closest('.calendar-dropdown').querySelector('.dropdown-label').textContent = item.textContent;
            item.parentElement.classList.add('hidden');
        }
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.calendar-dropdown')) {
            document.querySelectorAll('.dropdown-menu').forEach(m => m.classList.add('hidden'));
        }
    });

    // --- 4. SAVE BUTTON LOGIC ---
    saveButton.addEventListener('click', () => {
        console.log("Save button clicked!");
        const isHalfDayMode = halfDayToggle.checked;
        const savedData = {
            mode: isHalfDayMode ? 'Half Day' : 'Normal',
            selection: {}
        };

        const dataCells = document.querySelectorAll('#calendarGrid > div:not(.font-semibold)');
        if (isHalfDayMode) {
            dataCells.forEach(cell => {
                if (cell.dataset.week && cell.dataset.week !== 'all') {
                    const day = cell.dataset.day;
                    const week = cell.dataset.week;
                    const value = cell.querySelector('.dropdown-label').textContent;

                    if (value !== 'Full Day') {
                        if (!savedData.selection[day]) {
                            savedData.selection[day] = {};
                        }
                        savedData.selection[day][week] = value;
                    }
                }
            });
        } else {
            dataCells.forEach(cell => {
                if (cell.dataset.week && cell.dataset.week !== 'all') {
                    const checkbox = cell.querySelector('.calendar-checkbox');
                    if (checkbox && checkbox.checked) {
                        const day = cell.dataset.day;
                        const week = cell.dataset.week;
                        if (!savedData.selection[day]) {
                            savedData.selection[day] = {};
                        }
                        savedData.selection[day][week] = true;
                    }
                }
            });
        }

        console.log("--- Data to be Saved ---");
        console.log(JSON.stringify(savedData, null, 2));
        alert("Calendar data has been collected! Check the browser console (F12) to see the data object.");
    });
});