import 'server-only';

import { Client } from '@notionhq/client';
import { cache } from 'react';
import {
  BlockObjectResponse,
  PageObjectResponse
} from '@notionhq/client/build/src/api-endpoints';

import { NotionToMarkdown } from 'notion-to-md';

export const notion = new Client({
  auth: process.env.NOTION_TOKEN
});

export const fetchPages = cache(() => {
  return notion.databases.query({
    database_id: process.env.NOTION_DATABASE_ID!,
    filter: {
      property: 'Status',
      status: {
        equals: 'Published'
      }
    }
  });
});

export const fetchPageBySlug = cache((slug: string) => {
  return notion.databases
    .query({
      database_id: process.env.NOTION_DATABASE_ID!,
      filter: {
        and: [
          {
            property: 'Slug',
            rich_text: {
              equals: slug
            }
          },
          {
            property: 'Status',
            status: {
              equals: 'Published'
            }
          }
        ]
      }
    })
    .then((res) => res.results[0] as PageObjectResponse | undefined);
});

export const fetchPageBlocks = cache((pageId: string) => {
  return notion.blocks.children
    .list({ block_id: pageId })
    .then((res) => res.results as BlockObjectResponse[]);
});

function getToday(dateString: string | undefined) {
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ];

  let date = new Date();

  if (dateString) {
    date = new Date(dateString);
  }

  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  const today = `${month} ${day}, ${year}`;

  return today;
}

const getPageMetaData = (post: PageObjectResponse) => {
  const getTags = (tags: { name: string }[]) => {
    const allTags = tags.map((tag) => {
      return tag.name;
    });

    return allTags;
  };

  return {
    id: post.id,
    title:
      post.properties.Title?.type === 'title'
        ? post.properties.Title.title[0]?.plain_text ?? ''
        : '',
    tags:
      post.properties.Tags?.type === 'multi_select'
        ? getTags(post.properties.Tags.multi_select)
        : [],
    description:
      post.properties.Description?.type === 'rich_text'
        ? post.properties.Description.rich_text[0]?.plain_text ?? ''
        : '',
    date:
      post.properties.Date?.type === 'date'
        ? getToday(post.properties.Date.date?.start)
        : '',
    slug:
      post.properties.Slug?.type === 'rich_text'
        ? post.properties.Slug.rich_text[0]?.plain_text ?? ''
        : '',
    icon: post.icon?.type === 'emoji' ? post.icon.emoji : null,
    cover: post.cover?.type === 'external' ? post.cover.external.url : null
  };
};

export const getAllPublished = async () => {
  const posts = await notion.databases.query({
    database_id: process.env.NOTION_DATABASE_ID!,
    filter: {
      property: 'Status',
      status: {
        equals: 'Published'
      }
    },
    sorts: [
      {
        property: 'Date',
        direction: 'descending'
      }
    ]
  });
  const allPosts = posts.results as PageObjectResponse[];

  return allPosts.map((post) => {
    return getPageMetaData(post);
  });
};

export const getAllInProgress = async () => {
  const posts = await notion.databases.query({
    database_id: process.env.NOTION_DATABASE_ID!,
    filter: {
      property: 'Status',
      status: {
        equals: 'In Progress'
      }
    }
  });

  const allPosts = posts.results as PageObjectResponse[];

  return allPosts.map((post) => {
    return getPageMetaData(post);
  });
};

const n2m = new NotionToMarkdown({
  notionClient: notion,
  config: { parseChildPages: false }
});

export const getSinglePost = async (slug: string) => {
  const response = await notion.databases.query({
    database_id: process.env.NOTION_DATABASE_ID!,
    filter: {
      and: [
        {
          property: 'Slug',
          rich_text: {
            equals: slug
          }
        },
        {
          property: 'Status',
          status: {
            equals: 'Published'
          }
        }
      ]
    }
  });

  const page = response.results[0] as PageObjectResponse | undefined;

  if (!page) {
    throw new Error('Page not found');
  }

  const metadata = getPageMetaData(page);
  const mdblocks = await n2m.pageToMarkdown(page.id);

  console.log({ mdblocks });

  const mdString = n2m.toMarkdownString(mdblocks);

  return {
    metadata,
    markdown: mdString
  };
};
