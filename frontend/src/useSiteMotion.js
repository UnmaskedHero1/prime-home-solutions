import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function useSiteMotion(rootRef) {
  useGSAP(() => {
    const root = rootRef.current;
    if (!root) return;

    const q = gsap.utils.selector(root);
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.to(q(".hero-grid"), {
        y: -70,
        autoAlpha: 0.35,
        ease: "none",
        scrollTrigger: {
          trigger: q(".hero"),
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      gsap.fromTo(
        q(".hero-rule"),
        { scaleX: 0.2 },
        {
          scaleX: 1,
          ease: "none",
          transformOrigin: "left center",
          scrollTrigger: {
            trigger: q(".hero"),
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        }
      );

      q(".reveal-rule").forEach((rule) => {
        gsap.fromTo(
          rule,
          { scaleX: 0 },
          {
            scaleX: 1,
            ease: "none",
            transformOrigin: "left center",
            scrollTrigger: {
              trigger: rule,
              start: "top 88%",
              end: "top 64%",
              scrub: true,
            },
          }
        );
      });

      q(".service-card").forEach((card) => {
        gsap.fromTo(
          card,
          { y: 56, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            ease: "none",
            scrollTrigger: {
              trigger: card,
              start: "top 92%",
              end: "top 62%",
              scrub: true,
            },
          }
        );
      });

      q(".compare").forEach((block) => {
        gsap.fromTo(
          block.querySelector(".compare-after"),
          { clipPath: "inset(0 100% 0 0)" },
          {
            clipPath: "inset(0 0% 0 0)",
            ease: "none",
            scrollTrigger: {
              trigger: block,
              start: "top 78%",
              end: "center 48%",
              scrub: true,
            },
          }
        );
      });

      const charlotte = q(".charlotte")[0];
      if (charlotte) {
        gsap.fromTo(
          q(".drift-left"),
          { xPercent: 10 },
          {
            xPercent: -10,
            ease: "none",
            scrollTrigger: {
              trigger: charlotte,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          }
        );
        gsap.fromTo(
          q(".drift-right"),
          { xPercent: -10 },
          {
            xPercent: 10,
            ease: "none",
            scrollTrigger: {
              trigger: charlotte,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          }
        );
      }

      const owner = q(".owner")[0];
      if (owner) {
        gsap.fromTo(
          q(".owner-photo"),
          { y: 36, scale: 1.08 },
          {
            y: -24,
            scale: 1,
            ease: "none",
            scrollTrigger: {
              trigger: owner,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          }
        );
        gsap.fromTo(
          q(".owner-copy"),
          { y: 40, autoAlpha: 0.15 },
          {
            y: 0,
            autoAlpha: 1,
            ease: "none",
            scrollTrigger: {
              trigger: q(".owner-copy"),
              start: "top 86%",
              end: "top 55%",
              scrub: true,
            },
          }
        );
      }

      gsap.fromTo(
        q(".form"),
        { y: 48, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          ease: "none",
          scrollTrigger: {
            trigger: q(".form"),
            start: "top 92%",
            end: "top 62%",
            scrub: true,
          },
        }
      );

      let marquee;
      const buildMarquee = () => {
        marquee?.kill();
        const cards = q(".review-card");
        const viewport = q(".review-viewport")[0];
        if (!cards.length || !viewport) return;

        const gap = 18;
        const cardWidth = cards[0].getBoundingClientRect().width;
        const slot = cardWidth + gap;
        const loopWidth = slot * cards.length;
        const wrap = gsap.utils.wrap(-slot, loopWidth - slot);

        gsap.set(viewport, { height: cards[0].offsetHeight });
        gsap.set(cards, {
          position: "absolute",
          top: 0,
          left: 0,
          x: (index) => index * slot,
          y: 0,
        });

        marquee = gsap.to(cards, {
          x: `-=${loopWidth}`,
          duration: loopWidth / 36,
          ease: "none",
          repeat: -1,
          modifiers: {
            x: gsap.utils.unitize(wrap),
          },
        });
      };

      buildMarquee();
      window.addEventListener("resize", buildMarquee);

      const refresh = () => ScrollTrigger.refresh();
      q("img").forEach((img) => {
        if (!img.complete) img.addEventListener("load", refresh, { once: true });
      });
      requestAnimationFrame(refresh);

      return () => {
        window.removeEventListener("resize", buildMarquee);
        marquee?.kill();
      };
    });

    return () => mm.revert();
  }, { scope: rootRef });
}
