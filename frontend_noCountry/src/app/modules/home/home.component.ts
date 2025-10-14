import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  imports: [RouterLink, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  isMobileMenuOpen = false;
  private resizeObserver?: ResizeObserver;

  ngOnInit(): void {
    // Inicialización del componente
    console.log('HomeComponent inicializado');
  }

  ngAfterViewInit(): void {
    // Pequeño delay para asegurar que el DOM esté completamente cargado
    setTimeout(() => {
      this.setupFAQ();
      this.setupSmoothScroll();
      this.setupScrollAnimations();
      this.setupMobileMenu();
      this.setupResizeHandler();
    }, 100);
  }

  ngOnDestroy(): void {
    // Limpiar observers y event listeners
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    
    // Restaurar scroll del body
    document.body.style.overflow = '';
  }

  private setupMobileMenu(): void {
    const toggle = document.querySelector('.navbar-toggle');
    const navbar = document.querySelector('.navbar');
    const mobileMenu = document.querySelector('.navbar-mobile');
    const navLinks = document.querySelectorAll('.nav-link-mobile');

    console.log('Setup Mobile Menu:', {
      toggle: !!toggle,
      navbar: !!navbar,
      mobileMenu: !!mobileMenu,
      navLinks: navLinks.length
    });

    if (!toggle || !navbar || !mobileMenu) {
      console.error('Navbar elements not found');
      return;
    }

    // Toggle del menú mobile
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      this.isMobileMenuOpen = !this.isMobileMenuOpen;
      
      console.log('Toggle clicked, menu open:', this.isMobileMenuOpen);
      
      if (this.isMobileMenuOpen) {
        navbar.classList.add('mobile-active');
        toggle.classList.add('active');
        document.body.style.overflow = 'hidden';
      } else {
        navbar.classList.remove('mobile-active');
        toggle.classList.remove('active');
        document.body.style.overflow = '';
      }
    });

    // Cerrar menú al hacer clic en un link
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        console.log('Nav link clicked');
        if (this.isMobileMenuOpen) {
          this.closeMobileMenu(navbar, toggle);
        }
      });
    });

    // Cerrar menú al hacer clic fuera de él
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      const isClickInsideMenu = mobileMenu.contains(target);
      const isClickOnToggle = toggle.contains(target);

      if (!isClickInsideMenu && !isClickOnToggle && this.isMobileMenuOpen) {
        console.log('Click outside menu');
        this.closeMobileMenu(navbar, toggle);
      }
    });
  }

  private closeMobileMenu(navbar: Element, toggle: Element): void {
    this.isMobileMenuOpen = false;
    navbar.classList.remove('mobile-active');
    toggle.classList.remove('active');
    document.body.style.overflow = '';
  }

  private setupResizeHandler(): void {
    this.resizeObserver = new ResizeObserver(() => {
      // Cerrar menú mobile si la ventana se expande a desktop
      if (window.innerWidth > 1024 && this.isMobileMenuOpen) {
        const navbar = document.querySelector('.navbar');
        const toggle = document.querySelector('.navbar-toggle');
        
        if (navbar && toggle) {
          this.closeMobileMenu(navbar, toggle);
        }
      }
    });

    this.resizeObserver.observe(document.body);
  }

  private setupFAQ(): void {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
      const question = item.querySelector('.faq-question');
      
      if (!question) return;

      question.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        
        // Cerrar otros items abiertos
        faqItems.forEach(otherItem => {
          if (otherItem !== item) {
            otherItem.classList.remove('active');
          }
        });
        
        // Toggle del item actual
        if (isActive) {
          item.classList.remove('active');
        } else {
          item.classList.add('active');
        }
      });
    });
  }

  private setupSmoothScroll(): void {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
      link.addEventListener('click', (e: Event) => {
        e.preventDefault();
        const href = (link as HTMLAnchorElement).getAttribute('href');
        
        if (href && href !== '#') {
          const target = document.querySelector(href);
          if (target) {
            const navbarHeight = 80; // Altura del navbar fijo
            const offsetTop = target.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
            
            window.scrollTo({
              top: offsetTop,
              behavior: 'smooth'
            });

            // Cerrar menú mobile si está abierto
            if (this.isMobileMenuOpen) {
              const navbar = document.querySelector('.navbar');
              const toggle = document.querySelector('.navbar-toggle');
              if (navbar && toggle) {
                this.closeMobileMenu(navbar, toggle);
              }
            }
          }
        }
      });
    });
  }

  private setupScrollAnimations(): void {
    const observerOptions: IntersectionObserverInit = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
          // Opcional: dejar de observar después de animar
          // observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Observar elementos animables
    const animatableElements = document.querySelectorAll(
      '.especialidad-card, .paso, .beneficio-card, .testimonio-card, .galeria-item'
    );
    
    animatableElements.forEach(el => {
      observer.observe(el);
    });
  }

  // Método público para scroll programático (opcional)
  public scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      const navbarHeight = 80;
      const offsetTop = element.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
      
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
    }
  }

  // Método para toggle manual del menú (opcional)
  public toggleMobileMenu(): void {
    const toggle = document.querySelector('.navbar-toggle');
    const navbar = document.querySelector('.navbar');
    
    if (toggle && navbar) {
      this.isMobileMenuOpen = !this.isMobileMenuOpen;
      navbar.classList.toggle('mobile-active');
      toggle.classList.toggle('active');
      
      if (this.isMobileMenuOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    }
  }
}