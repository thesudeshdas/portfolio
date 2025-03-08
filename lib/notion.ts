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

function getToday(datestring) {
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

  if (datestring) {
    date = new Date(datestring);
  }

  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  const today = `${month} ${day}, ${year}`;

  return today;
}

const getPageMetaData = (post: PageObjectResponse) => {
  const getTags = (tags) => {
    const allTags = tags.map((tag) => {
      return tag.name;
    });

    return allTags;
  };

  return {
    id: post.id,
    title: post.properties.Title.title[0].plain_text,
    tags: getTags(post.properties.Tags.multi_select),
    description: post.properties.Description.rich_text[0].plain_text,
    date: getToday(post.properties.Date.date?.start),
    slug: post.properties.Slug.rich_text[0].plain_text
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
    }
  });
  const allPosts = posts.results;

  return allPosts.map((post) => {
    return getPageMetaData(post);
  });
};

const n2m = new NotionToMarkdown({ notionClient: notion });

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
  const metadata = getPageMetaData(page);
  const mdblocks = await n2m.pageToMarkdown(page.id);
  const mdString = n2m.toMarkdownString(mdblocks);

  return {
    metadata,
    markdown: mdString
  };
};
