/**
 * In-memory Foodist API mock for Playwright.
 * Blocks live production Workers traffic so E2E never mutates real data.
 */

export const API_HOST = 'foodist_backend.omnc2019.workers.dev';

function json(data, status = 200) {
  return {
    status,
    contentType: 'application/json',
    body: JSON.stringify(data),
  };
}

function publicUser(user) {
  const { password, ...safe } = user;
  return safe;
}

export async function installMockApi(page) {
  const state = {
    users: [],
    nextUserId: 1,
    recipes: [],
    nextRecipeId: 1,
    saved: [], // { userID, recipeID }
    tokens: new Map(), // token -> userId
  };

  // Hard block any non-mocked hit to the production worker hostname
  await page.route(`**://${API_HOST}/**`, async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    const path = url.pathname.replace(/\/$/, '') || '/';
    const method = req.method().toUpperCase();
    const auth = req.headers()['authorization'] || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    const authedUserId = token ? state.tokens.get(token) : null;

    // AUTH
    if (method === 'POST' && path === '/auth/register') {
      const body = req.postDataJSON();
      if (state.users.some((u) => u.email === body.email)) {
        return route.fulfill(json({ error: 'User already exists' }, 400));
      }
      const user = {
        id: state.nextUserId++,
        email: body.email,
        password: body.password,
        username: null,
        pfpUrl: null,
        bio: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      state.users.push(user);
      return route.fulfill(json(publicUser(user), 201));
    }

    if (method === 'POST' && path === '/auth/login') {
      const body = req.postDataJSON();
      const user = state.users.find((u) => u.email === body.email && u.password === body.password);
      if (!user) {
        return route.fulfill(json({ error: 'Invalid email or password' }, 401));
      }
      const t = `tok-${user.id}-${Date.now()}`;
      state.tokens.set(t, user.id);
      return route.fulfill(
        json({
          message: 'Login successful',
          token: t,
          user: publicUser(user),
        })
      );
    }

    if (method === 'GET' && path === '/auth/me') {
      if (!authedUserId) return route.fulfill(json({ error: 'Unauthorized' }, 401));
      const user = state.users.find((u) => u.id === authedUserId);
      if (!user) return route.fulfill(json({ error: 'User not found' }, 404));
      return route.fulfill(json(publicUser(user)));
    }

    // RECIPES
    if (method === 'GET' && path === '/recipes') {
      return route.fulfill(json(state.recipes));
    }

    if (method === 'GET' && path === '/recipes/search') {
      return route.fulfill(json(state.recipes));
    }

    const recipeMatch = path.match(/^\/recipes\/(\d+)$/);
    if (method === 'GET' && recipeMatch) {
      const recipe = state.recipes.find((r) => r.id === Number(recipeMatch[1]));
      if (!recipe) return route.fulfill(json({ error: 'Recipe not found' }, 404));
      return route.fulfill(json(recipe));
    }

    if (method === 'POST' && path === '/recipes') {
      if (!authedUserId) return route.fulfill(json({ error: 'Unauthorized' }, 401));
      // multipart FormData — parse via postDataBuffer is awkward; use postData() text fields if available
      let title = 'Untitled';
      let description = '';
      let mealtype = 'BREAKFAST';
      let ingredients = [];
      let descriptionBlocks = [];

      const contentType = req.headers()['content-type'] || '';
      if (contentType.includes('multipart/form-data')) {
        // Playwright provides multipart fields via postData(); fall back to defaults if unavailable
        const buffer = req.postDataBuffer();
        const raw = buffer ? buffer.toString('utf8') : '';
        const grab = (name) => {
          const re = new RegExp(`name="${name}"\\r?\\n\\r?\\n([\\s\\S]*?)\\r?\\n--`);
          const m = raw.match(re);
          return m ? m[1].trim() : null;
        };
        title = grab('title') || title;
        description = grab('description') || description;
        mealtype = grab('mealtype') || mealtype;
        try {
          ingredients = JSON.parse(grab('ingredients') || '[]');
        } catch {
          ingredients = [];
        }
        try {
          descriptionBlocks = JSON.parse(grab('descriptionBlocks') || '[]');
        } catch {
          descriptionBlocks = [];
        }
      }

      const user = state.users.find((u) => u.id === authedUserId);
      const recipe = {
        id: state.nextRecipeId++,
        title,
        description,
        mealtype,
        servingSize: 1,
        level: 1,
        prepTime: 0,
        cookTime: 0,
        titleImage: null,
        titleImageUrl: null,
        authorName: user?.email || null,
        user: user ? { id: user.id, email: user.email, username: user.username } : null,
        userID: authedUserId,
        ingredients: ingredients.map((ing, i) => ({
          id: i + 1,
          name: ing.name || ing.value,
          amount: [ing.amount, ing.unit].filter(Boolean).join(' '),
          value: ing.name || ing.value,
          measurement: [ing.amount, ing.unit].filter(Boolean).join(' '),
        })),
        descriptionBlocks: descriptionBlocks.map((b, i) => ({
          id: i + 1,
          description: b.content || b.description || '',
          content: b.content || b.description || '',
          step: b.step || i + 1,
          imageUrl: null,
        })),
        comments: [],
        averageRating: null,
        totalComments: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      state.recipes.push(recipe);
      return route.fulfill(json(recipe, 201));
    }

    // SAVED RECIPES
    const checkMatch = path.match(/^\/saved-recipes\/check\/(\d+)$/);
    if (method === 'GET' && checkMatch) {
      if (!authedUserId) return route.fulfill(json({ error: 'Unauthorized' }, 401));
      const recipeID = Number(checkMatch[1]);
      const saved = state.saved.find((s) => s.userID === authedUserId && s.recipeID === recipeID);
      return route.fulfill(json({ isSaved: !!saved, savedRecipe: saved || null }));
    }

    const savedMatch = path.match(/^\/saved-recipes\/(\d+)$/);
    if (method === 'POST' && savedMatch) {
      if (!authedUserId) return route.fulfill(json({ error: 'Unauthorized' }, 401));
      const recipeID = Number(savedMatch[1]);
      if (!state.recipes.some((r) => r.id === recipeID)) {
        return route.fulfill(json({ error: 'Recipe not found' }, 404));
      }
      if (state.saved.some((s) => s.userID === authedUserId && s.recipeID === recipeID)) {
        return route.fulfill(json({ error: 'Recipe already saved' }, 400));
      }
      const entry = { id: state.saved.length + 1, userID: authedUserId, recipeID, note: null };
      state.saved.push(entry);
      return route.fulfill(json(entry, 201));
    }

    if (method === 'DELETE' && savedMatch) {
      if (!authedUserId) return route.fulfill(json({ error: 'Unauthorized' }, 401));
      const recipeID = Number(savedMatch[1]);
      const idx = state.saved.findIndex((s) => s.userID === authedUserId && s.recipeID === recipeID);
      if (idx === -1) return route.fulfill(json({ error: 'Recipe not saved' }, 404));
      state.saved.splice(idx, 1);
      return route.fulfill(json({ message: 'Recipe unsaved successfully' }));
    }

    if (method === 'GET' && path === '/saved-recipes') {
      if (!authedUserId) return route.fulfill(json({ error: 'Unauthorized' }, 401));
      const items = state.saved
        .filter((s) => s.userID === authedUserId)
        .map((s) => ({
          ...s,
          recipe: state.recipes.find((r) => r.id === s.recipeID) || null,
        }));
      return route.fulfill(json(items));
    }

    // Unhandled mock path — fail loudly instead of forwarding to production
    return route.fulfill(
      json(
        {
          error: 'Unhandled mock route',
          method,
          path,
        },
        501
      )
    );
  });

  return state;
}
