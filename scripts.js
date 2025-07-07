// Remove the import statements and use global variables
// import gsap from 'gsap';
// import { CustomEase } from 'gsap/CustomEase';
// import SplitType from 'split-type';
// import items from './items.js';

// Define items array directly in this file
const items = [
    "@hsyn._art.jpg",
    "@hsyn._art (1).jpg",
    "@hsyn._art (2).jpg",
    "@hsyn._art (3).jpg",
    "@hsyn._art (4).jpg",
    "@hsyn._art (5).jpg",
    "@hsyn._art (6).jpg",
    "@hsyn._art (7).jpg",
    "@hsyn._art (8).jpg",
    "@hsyn._art (9).jpg",
    "@hsyn._art (10).jpg",
    "@hsyn._art (11).jpg",
    "@hsyn._art (12).jpg",
    "@hsyn._art (13).jpg",
    "@hsyn._art (14).jpg",
    "@hsyn._art (15).jpg",
    "@hsyn._art (16).jpg",
    "@hsyn._art (17).jpg",
    "@hsyn._art (18).jpg",
    "@hsyn._art (19).jpg",
    "@hsyn._art (20).jpg",
    "@hsyn._art (21).jpg",
    "@hsyn._art (22).jpg",
    "@hsyn._art (23).jpg"
];

// Add titles array to match the items
const titles = [
    "T-Zaytuna",
    "Artwork One",
    "Artwork Two", 
    "Artwork Three",
    "Artwork Four",
    "Artwork Five",
    "Artwork Six",
    "Artwork Seven",
    "Artwork Eight",
    "Artwork Nine",
    "Artwork Ten",
    "Artwork Eleven",
    "Artwork Twelve",
    "Artwork Thirteen",
    "Artwork Fourteen",
    "Artwork Fifteen",
    "Artwork Sixteen",
    "Artwork Seventeen",
    "Artwork Eighteen",
    "Artwork Nineteen",
    "Artwork Twenty",
    "Artwork Twenty-One",
    "Artwork Twenty-Two",
    "Artwork Twenty-Three"
];

gsap.registerPlugin(CustomEase);
CustomEase.create("hop", "0.9, 0, 0.1, 1");

const container = document.querySelector('.container');
const canvas = document.querySelector('.canvas');
const overlay = document.querySelector('.overlay');
const projectTitleElement = document.querySelector('.nav-title');

const itemCount = items.length;
const itemGap = 80;
const columns = 4;
const itemWidth = 160;
const itemHeight = 200;

let isDragging = false;
let startX, startY;

let targetX = 0;
let targetY = 0;
let currentX = 0;
let currentY = 0;
let dragVelocityX = 0;
let dragVelocityY = 0;
let lastDragTime = 0;
let mouseHasMoved = false;
let visibleItems = new Set();
let lastUpdateTime = 0;
let lastX = 0;
let lastY = 0;
let isExpanded = false;
let activeItem = null;
let canDrag = true;
let originalPosition = null;
let expandedItem = null;
let activeItemId = null;
let titleSplit = null;

function calculateResponsiveDimensions() {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Calculate maximum available space (leaving some padding)
    const maxWidth = viewportWidth * 0.8;
    const maxHeight = viewportHeight * 0.7;
    
    // Calculate target dimensions maintaining aspect ratio
    const aspectRatio = itemHeight / itemWidth; // 160/120 = 1.33
    
    let targetWidth, targetHeight;
    
    // Check if width-constrained or height-constrained
    if (maxWidth * aspectRatio <= maxHeight) {
        // Width-constrained
        targetWidth = maxWidth;
        targetHeight = maxWidth * aspectRatio;
    } else {
        // Height-constrained
        targetHeight = maxHeight;
        targetWidth = maxHeight / aspectRatio;
    }
    
    return { targetWidth, targetHeight };
}

function setAndAnimateTitle(title) {
    if (titleSplit) titleSplit.revert();
    projectTitleElement.textContent = title;
    titleSplit = new SplitType(projectTitleElement, { types: "words"});
    // Set initial position to visible instead of hidden
    gsap.set(titleSplit.words, {y : "0%", opacity: 1});
}

function animateTitleIn() {
    gsap.to(titleSplit.words, {
        duration: 1,
        ease: "power3.out",
        y: "0%",
        opacity: 1,
        stagger: 0.1,
    });
}

function animateTitleOut() {
    gsap.to(titleSplit.words, {
        duration: 1,
        ease: "power3.out",
        y: "-100%",
        opacity: 0,
        stagger: 0.1,
    });
}


function updateVisibleItems() {
    const buffer = 2.5;
    const viewWidth = window.innerWidth * (1+buffer);
    const viewHeight = window.innerHeight * (1+buffer);
    const movingRight = targetX > currentX;
    const movingDown = targetY > currentY;
    const directionBufferX = movingRight ? -300 : 300;
    const directionBufferY = movingDown ? -300 : 300;

    const startCol = Math.floor(
        (-currentX - viewWidth / 2 + (movingRight ? directionBufferX : 0)) / (itemWidth + itemGap)
    );
    const endCol = Math.ceil(
        (-currentX + viewWidth * 1.5 + (!movingRight ? directionBufferX : 0)) / (itemWidth + itemGap)
    );
    const startRow = Math.floor(
        (-currentY - viewHeight / 2 + (movingDown ? directionBufferY : 0)) / (itemHeight + itemGap)
    );
    const endRow = Math.ceil(
        (-currentY + viewHeight * 1.5 + (!movingDown ? directionBufferY : 0)) / (itemHeight + itemGap)
    );

    const currentItems = new Set();

    for (let row = startRow; row <= endRow; row++) {
        for (let col = startCol; col <= endCol; col++) {
            const itemId = `${col},${row}`;
           currentItems.add(itemId);

           if (visibleItems.has(itemId)) continue;
           if (activeItemId === itemId && isExpanded) continue;

           const item = document.createElement('div');
           item.className = 'item';
           item.id = itemId;
           item.style.left = `${col * (itemWidth + itemGap)}px`;
           item.style.top = `${row * (itemHeight + itemGap)}px`;
           item.dataset.col = col;
           item.dataset.row = row;

           const itemNum = (Math.abs(row * columns + col) % itemCount) + 1;
           const img = document.createElement('img');
           img.src = `public/${items[itemNum - 1]}`;
           img.alt = `Image ${itemNum}`;
           item.appendChild(img);

           item.addEventListener('click', () => {
            if (mouseHasMoved ||isDragging ) return;
            handleItemClick(itemId);
        });
        canvas.appendChild(item);
        visibleItems.add(itemId);
    }
}

    visibleItems.forEach((itemID) =>{ 
        if (!currentItems.has(itemID) || (activeItemId === itemID && isExpanded)) {
            const item = document.getElementById(itemID);
            if (item) canvas.removeChild(item);
            visibleItems.delete(itemID);
        }
    });
}

function handleItemClick(itemId) {
    if (isExpanded) {
        if (expandedItem) closeExpandedItem();
    }else{
        expandItem(itemId);
    }
}

function expandItem(itemId) {
    isExpanded = true;
    const item = document.getElementById(itemId);
    activeItem = item; 
    activeItemId = itemId;
    canDrag = false;
    container.style.cursor = 'auto';

    const imgSrc = item.querySelector('img').src;
    const imgMatch = imgSrc.match(/public\/(.+)/);
    const imgFileName = imgMatch ? imgMatch[1] : items[0];
    const titleIndex = items.indexOf(imgFileName);

    // Hide the title when expanding
    gsap.to('.nav-title', {
        opacity: 0,
        duration: 0.3,
        ease: "power2.out"
    });
    
    setAndAnimateTitle(titles[titleIndex]);
    item.style.visibility = "hidden";

    const rect = item.getBoundingClientRect();
    const targetImg = item.querySelector('img').src;

    originalPosition = {
        id: item.id,
        rect: rect,
        imgSrc: targetImg,
    };

    overlay.classList.add('active');

    expandedItem = document.createElement('div');
    expandedItem.className = 'expanded-item';
    expandedItem.style.width = `${itemWidth}px`;
    expandedItem.style.height = `${itemHeight}px`;

    const img = document.createElement('img');
    img.src = targetImg;
    expandedItem.appendChild(img);
    expandedItem.addEventListener("click", closeExpandedItem);
    document.body.appendChild(expandedItem);

    // Create donation buttons container
    const donationContainer = document.createElement('div');
    donationContainer.className = 'donation-container';
    donationContainer.innerHTML = `
        <div class="donation-buttons">
            <button class="donation-btn primary" onclick="window.open('https://donate.example.com', '_blank')">
                Donate Now
            </button>
            <button class="donation-btn secondary" onclick="window.open('https://prints.example.com', '_blank')">
                Buy Prints
            </button>
            <button class="donation-btn secondary" onclick="window.open('https://shirts.example.com', '_blank')">
                Buy as Shirt
            </button>
            <button class="donation-btn secondary" onclick="window.open('https://totes.example.com', '_blank')">
                Buy as Tote Bag
            </button>
        </div>
    `;
    document.body.appendChild(donationContainer);

    // Prevent donation buttons from closing the expanded item
    donationContainer.addEventListener("click", (e) => {
        e.stopPropagation();
    });

    document.querySelectorAll(".item").forEach((el) => {
        if (el === activeItem) {
            gsap.to(el, {
                opacity: 0,
                duration: 0.3,
                ease: "power2.out",
            });
        }
    });

    const { targetWidth, targetHeight } = calculateResponsiveDimensions();

    gsap.delayedCall(0.5, animateTitleIn);

    gsap.fromTo(
        expandedItem,
        {
            width: itemWidth,
            height: itemHeight,
            x: rect.left + itemWidth / 2 - window.innerWidth / 2,
            y: rect.top + itemHeight / 2 - window.innerHeight / 2,
        },
        {
            width: targetWidth,
            height: targetHeight,
            x: 0,
            y: 0,
            duration: 1,
            ease: "hop",
        }
    );

    // Animate donation buttons in immediately
    gsap.fromTo(donationContainer, 
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out", delay: 0.3 }
    );
}


function closeExpandedItem() {
    if (!expandedItem || !originalPosition) return;

    animateTitleOut();
    overlay.classList.remove('active');
    const originalRect = originalPosition.rect;

    // Remove donation buttons immediately
    const donationContainer = document.querySelector('.donation-container');
    if (donationContainer && donationContainer.parentNode) {
        donationContainer.parentNode.removeChild(donationContainer);
    }

    document.querySelectorAll(".item").forEach((el) => {
        if (el.id === activeItemId) {
            gsap.to(el, {
                opacity: 1,
                duration: 0.5,
                delay: 0.5,
                ease: "power2.out",
            });
        }
    });
    
    const originalItem = document.getElementById(activeItemId);

    gsap.to(expandedItem, {
        width: itemWidth,
        height: itemHeight,
        x: originalRect.left + itemWidth / 2 - window.innerWidth / 2,
        y: originalRect.top + itemHeight / 2 - window.innerHeight / 2,
        duration: 1,
        ease: "hop",
        onComplete: () => {
            if (expandedItem && expandedItem.parentNode) {
                expandedItem.parentNode.removeChild(expandedItem);
            }
            if (originalItem) {
                originalItem.style.visibility = "visible";
            }
            
            expandedItem = null;
            isExpanded = false;
            activeItem = null;
            originalPosition = null;
            activeItemId = null;
            canDrag = true;
            container.style.cursor = "grab";
            dragVelocityX = 0;
            dragVelocityY = 0;
            
            // Show the title again when item is closed, and reset to T-Zaytuna
            setAndAnimateTitle("T-Zaytuna");
            gsap.to('.nav-title', {
                opacity: 1,
                duration: 0.5,
                delay: 0.3,
                ease: "power2.out"
            });
        },
    });
}

function animate(){
    if (canDrag) {
        const ease = 0.075;
        currentX += (targetX - currentX) * ease;
        currentY += (targetY - currentY) * ease;

        canvas.style.transform = `translate(${currentX}px, ${currentY}px)`;
        const now = Date.now();
        const distMoved = Math.sqrt(
            Math.pow(currentX - lastX, 2) + Math.pow(currentY - lastY, 2)
        );

        if (distMoved > 100 || now - lastUpdateTime > 120) {
            updateVisibleItems();
            lastX = currentX;
            lastY = currentY;
            lastUpdateTime = now;
        }
    }

    requestAnimationFrame(animate);
}

container.addEventListener('mousedown', (e) => {
    if (!canDrag) return;
    isDragging = true;
    mouseHasMoved = false;
    startX = e.clientX;
    startY = e.clientY;
    container.style.cursor = 'grabbing';
});

window.addEventListener('mousemove', (e) => {
    if (!isDragging || !canDrag) return;

    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        mouseHasMoved = true;
    }

    const now = Date.now();
    const dt = Math.max(10, now - lastDragTime);
    lastDragTime = now;

    dragVelocityX = dx /dt;
    dragVelocityY = dy /dt;

    targetX +=  dx;
    targetY += dy;

    startX = e.clientX;
    startY = e.clientY;
});

window.addEventListener('mouseup', (e) => {
    if (!isDragging) return;
    isDragging = false;

    if (canDrag) {
        container.style.cursor = 'grab';

        if (Math.abs(dragVelocityX) > 0.1 || Math.abs(dragVelocityY) > 0.1) {
            const momentumFactor = 200;
            targetX += dragVelocityX * momentumFactor;
            targetY += dragVelocityY * momentumFactor;
        }
    }
});

overlay.addEventListener('click', () => {
    if (isExpanded) {
        closeExpandedItem();
    }
});

container.addEventListener('touchstart', (e) => {
    if (!canDrag) return;
    isDragging = true;
    mouseHasMoved = false;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
});

window.addEventListener('touchmove', (e) => {
    if (!isDragging || !canDrag) return;

    const dx = e.touches[0].clientX - startX;
    const dy = e.touches[0].clientY - startY;

    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        mouseHasMoved = true;
    }

    targetX += dx;
    targetY += dy;

    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
});

window.addEventListener('touchend', () => {
    isDragging = false;
});

window.addEventListener('resize', () => {
    if (isExpanded && expandedItem) {
        const { targetWidth, targetHeight } = calculateResponsiveDimensions();

        gsap.to(expandedItem, {
            width: targetWidth,
            height: targetHeight,
            duration: 0.3,
            ease: "power2.out",
        });
    }else{
        updateVisibleItems();
    }
});

updateVisibleItems();
animate();

// Set initial title with a small delay to ensure DOM is ready
setTimeout(() => {
    setAndAnimateTitle("T-Zaytuna");
    // Ensure the title is visible
    gsap.set('.nav-title', { opacity: 1 });
}, 100);