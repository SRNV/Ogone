import scopeCss from "../lib/html-this/scopeCSS.ts";
import { assertEquals } from "../deps/deps.ts";

Deno.test("- scopecss can scope classes", () => {
  const scoped = scopeCss(`.class1 .class2 .class3{}`, "data-1");
  assertEquals(scoped, `.class1[data-1] .class2[data-1] .class3[data-1]{}`);
});

Deno.test("- scopecss can scope ids", () => {
  const scoped = scopeCss(`#id1 #id2 #id3{}`, "data-1");
  assertEquals(scoped, `#id1[data-1] #id2[data-1] #id3[data-1]{}`);
});

Deno.test("- scopecss can scope ids and classes", () => {
  const scoped = scopeCss(`#id1.class2 #id2.class3 #id3.class1{}`, "data-1");
  assertEquals(
    scoped,
    `#id1.class2[data-1] #id2.class3[data-1] #id3.class1[data-1]{}`,
  );
});

Deno.test("- scopecss doesn't scope special character", () => {
  const scoped = scopeCss(
    `#id1.class2 > #id2.class3 + #id3.class1 \${}`,
    "data$1",
  );
  const scoped2 = scopeCss(
    `#id1.class2 > #id2.class3 + #id3.class1 _{}`,
    "data_1",
  );
  const scoped3 = scopeCss(
    `#id1.class2 > #id2.class3 + #id3.class1 -{}`,
    "data-1",
  );
  assertEquals(
    scoped,
    `#id1.class2[data$1] > #id2.class3[data$1] + #id3.class1[data$1] \${}`,
  );
  assertEquals(
    scoped2,
    `#id1.class2[data_1] > #id2.class3[data_1] + #id3.class1[data_1] _{}`,
  );
  assertEquals(
    scoped3,
    `#id1.class2[data-1] > #id2.class3[data-1] + #id3.class1[data-1] -{}`,
  );
});

Deno.test("- scopecss doesn't scope @keyframe's body: from, to, 100%,", () => {
  const css = `
  @keyframes dfdqfsq$___6546543- --65 _$$anim {
    from {}
    to {}
    100% {}
    0% {}
    anything but just don't scope it {}
  }
  `;
  const scoped = scopeCss(css, "data-1");
  assertEquals(scoped, css);
});

Deno.test("- scopecss doesn't scope @page", () => {
  const css = `
@page {
  margin: 1cm;
}

@page :first {
  margin: 2cm;
}
  `;
  const scoped = scopeCss(css, "data-1");
  assertEquals(scoped, css);
});

Deno.test("- scopecss doesn't scope @font-face", () => {
  const css = `
  @font-face {
  font-family: "Open Sans";
  src: url("/fonts/OpenSans-Regular-webfont.woff2") format("woff2"),
          url("/fonts/OpenSans-Regular-webfont.woff") format("woff");
  }`;
  const scoped = scopeCss(css, "data-1");
  assertEquals(scoped, css);
});

Deno.test("- scopecss doesn't scope @font-feature-values", () => {
  const css = `
  @font-feature-values Font One {
  /* On active la caractéristique nice-style
    sur Font One */
    @styleset {
      nice-style: 12;
    }
  }

  @font-feature-values Font Two {
  /* On active la caractéristique nice-style
    sur Font Two */
    @styleset {
      nice-style: 4;
    }
  }`;
  const scoped = scopeCss(css, "data-1");
  assertEquals(scoped, css);
});

Deno.test("- scopecss doesn't scope pseudo elements", () => {
  const css = `
    #id1::tllhqdskfq_rezraez4324_pseudo---dsfdsfds::t {}
  `.trim();
  const expected = `
  #id1[data-1]::tllhqdskfq_rezraez4324_pseudo---dsfdsfds::t {}
  `.trim();
  const scoped = scopeCss(css, "data-1");
  assertEquals(scoped, expected);
});
