import json
from app.database import engine, SessionLocal, Base
from app.models import Meeting, Participant, TranscriptSegment, Summary, ActionItem, Topic

def seed_database():
    # Recreate tables cleanly
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        # -------------------------------------------------------------
        # Meeting 1: Product Strategy & Q4 Roadmap Sync
        # -------------------------------------------------------------
        m1 = Meeting(
            title="Product Strategy & Q4 Roadmap Sync",
            date="Aug 10, 2026",
            time="10:30 AM",
            duration="1h 02m",
            description="Strategic review of Q4 product priorities, onboarding conversion funnel, and pricing tier updates."
        )
        db.add(m1)
        db.flush()

        p1_list = [
            Participant(meeting_id=m1.id, name="John Carter", email="john.carter@acme.io"),
            Participant(meeting_id=m1.id, name="Sarah Jenkins", email="sarah.j@acme.io"),
            Participant(meeting_id=m1.id, name="Mike Rivera", email="mike.r@acme.io"),
            Participant(meeting_id=m1.id, name="Emily Chen", email="emily.chen@acme.io")
        ]
        db.add_all(p1_list)

        t1_segments = [
            TranscriptSegment(meeting_id=m1.id, speaker="John Carter", start_time=0.0, end_time=15.0, text="Welcome everyone. Let's kick off our Q4 product strategy review."),
            TranscriptSegment(meeting_id=m1.id, speaker="Sarah Jenkins", start_time=15.0, end_time=32.0, text="Thanks John. First on the agenda is our onboarding conversion rate. Right now we're seeing a 14% drop-off at step 3."),
            TranscriptSegment(meeting_id=m1.id, speaker="Mike Rivera", start_time=32.0, end_time=50.0, text="I checked the telemetry data. Most users get stuck when configuring workspace permissions."),
            TranscriptSegment(meeting_id=m1.id, speaker="Emily Chen", start_time=50.0, end_time=68.0, text="We should simplify the default permission setup and defer advanced roles to settings."),
            TranscriptSegment(meeting_id=m1.id, speaker="John Carter", start_time=68.0, end_time=85.0, text="Agreed. Sarah, can you prepare a revised wireframe proposal by next Tuesday?"),
            TranscriptSegment(meeting_id=m1.id, speaker="Sarah Jenkins", start_time=85.0, end_time=102.0, text="Will do. Next up, let's review the pricing strategy and custom enterprise billing tier."),
            TranscriptSegment(meeting_id=m1.id, speaker="Mike Rivera", start_time=102.0, end_time=125.0, text="Enterprise customers have requested custom seat allocations and annual invoicing options."),
            TranscriptSegment(meeting_id=m1.id, speaker="Emily Chen", start_time=125.0, end_time=145.0, text="I can draft the API specifications for custom billing integration with Stripe."),
            TranscriptSegment(meeting_id=m1.id, speaker="John Carter", start_time=145.0, end_time=168.0, text="Great. What about our Q4 engineering milestones for backend infrastructure?"),
            TranscriptSegment(meeting_id=m1.id, speaker="Mike Rivera", start_time=168.0, end_time=190.0, text="We are migrating our database read replicas to improve response times during peak hours."),
            TranscriptSegment(meeting_id=m1.id, speaker="Sarah Jenkins", start_time=190.0, end_time=210.0, text="Awesome. Let's wrap up by scheduling our next review for Thursday at 2 PM.")
        ]
        db.add_all(t1_segments)

        s1 = Summary(
            meeting_id=m1.id,
            overview="The leadership team discussed Q4 product priorities, focusing on eliminating user onboarding friction at step 3, refining enterprise pricing models, and executing backend database scalability migrations.",
            key_points=json.dumps([
                "Identified 14% drop-off rate during step 3 of onboarding due to complex workspace permissions.",
                "Agreed to simplify onboarding defaults and push granular role configuration to settings.",
                "Approved development of custom enterprise seat allocation and invoice billing models.",
                "Initiated database read replica migration to reduce query latency during peak operational hours."
            ])
        )
        db.add(s1)

        top1_list = [
            Topic(meeting_id=m1.id, title="1. Onboarding Friction Analysis", start_time=15.0),
            Topic(meeting_id=m1.id, title="2. UX Wireframe & Permission Simplification", start_time=50.0),
            Topic(meeting_id=m1.id, title="3. Enterprise Pricing & Invoicing Tier", start_time=85.0),
            Topic(meeting_id=m1.id, title="4. Backend Infrastructure Milestones", start_time=145.0)
        ]
        db.add_all(top1_list)

        act1_list = [
            ActionItem(meeting_id=m1.id, title="Prepare revised onboarding wireframes with simplified permissions", description="Focus on one-click defaults for team onboarding", assignee="Sarah Jenkins", due_date="Aug 18, 2026", completed=False),
            ActionItem(meeting_id=m1.id, title="Draft Stripe API specs for enterprise custom billing", description="Support annual invoicing and tiered seat seats", assignee="Emily Chen", due_date="Aug 20, 2026", completed=False),
            ActionItem(meeting_id=m1.id, title="Benchmark database read replica query response times", description="Stress test read replica failovers under simulated peak load", assignee="Mike Rivera", due_date="Aug 22, 2026", completed=True),
            ActionItem(meeting_id=m1.id, title="Schedule Q4 Product Roadmap alignment call with Design", description="Include product leads and UX researchers", assignee="John Carter", due_date="Aug 15, 2026", completed=False)
        ]
        db.add_all(act1_list)

        # -------------------------------------------------------------
        # Meeting 2: Weekly Engineering Architecture Sync
        # -------------------------------------------------------------
        m2 = Meeting(
            title="Weekly Engineering Architecture Sync",
            date="Aug 12, 2026",
            time="02:00 PM",
            duration="48m",
            description="Technical review of microservice decoupling, async queue performance, and automated CI/CD pipeline bottlenecks."
        )
        db.add(m2)
        db.flush()

        p2_list = [
            Participant(meeting_id=m2.id, name="Alex Mercer", email="alex.m@acme.io"),
            Participant(meeting_id=m2.id, name="David Kim", email="david.k@acme.io"),
            Participant(meeting_id=m2.id, name="Priya Patel", email="priya.p@acme.io")
        ]
        db.add_all(p2_list)

        t2_segments = [
            TranscriptSegment(meeting_id=m2.id, speaker="Alex Mercer", start_time=0.0, end_time=18.0, text="Hey team. Let's look at our pipeline build times first. E2E tests are taking 22 minutes."),
            TranscriptSegment(meeting_id=m2.id, speaker="David Kim", start_time=18.0, end_time=36.0, text="The bottleneck is parallel worker allocation in GitHub Actions. We can split test suites across 4 containers."),
            TranscriptSegment(meeting_id=m2.id, speaker="Priya Patel", start_time=36.0, end_time=58.0, text="I tested container matrix sharding yesterday. It reduced execution time down to 7 minutes."),
            TranscriptSegment(meeting_id=m2.id, speaker="Alex Mercer", start_time=58.0, end_time=76.0, text="That is a massive improvement! Priya, can you submit the workflow pull request today?"),
            TranscriptSegment(meeting_id=m2.id, speaker="Priya Patel", start_time=76.0, end_time=94.0, text="Sure thing. Second topic is asynchronous worker queue retry logic."),
            TranscriptSegment(meeting_id=m2.id, speaker="David Kim", start_time=94.0, end_time=118.0, text="When third-party webhooks fail, exponential backoff with jitter will prevent thundering herd problems."),
            TranscriptSegment(meeting_id=m2.id, speaker="Alex Mercer", start_time=118.0, end_time=140.0, text="Agreed. Let's configure Redis Celery retries to cap at 5 attempts with dead-letter queue routing."),
            TranscriptSegment(meeting_id=m2.id, speaker="Priya Patel", start_time=140.0, end_time=160.0, text="I will implement dead-letter queue monitoring alerts in Datadog."),
            TranscriptSegment(meeting_id=m2.id, speaker="David Kim", start_time=160.0, end_time=185.0, text="Also, remember to update our OpenAPI docs for the new webhook event format."),
            TranscriptSegment(meeting_id=m2.id, speaker="Alex Mercer", start_time=185.0, end_time=205.0, text="Sounds great. Let's review PRs right after this call.")
        ]
        db.add_all(t2_segments)

        s2 = Summary(
            meeting_id=m2.id,
            overview="Engineering sync focused on reducing test execution times by 68% using parallel GitHub Action matrix shards, and establishing resilient retry policies with dead-letter queue routing for webhooks.",
            key_points=json.dumps([
                "Reduced CI/CD build runtime from 22 minutes to 7 minutes via container matrix sharding.",
                "Standardized exponential backoff retry policies for asynchronous task workers.",
                "Established dead-letter queue fallback routing for failed webhook notifications.",
                "Planned OpenAPI specification updates for downstream API consumers."
            ])
        )
        db.add(s2)

        top2_list = [
            Topic(meeting_id=m2.id, title="1. CI/CD Pipeline Bottlenecks", start_time=0.0),
            Topic(meeting_id=m2.id, title="2. Matrix Test Sharding Results", start_time=36.0),
            Topic(meeting_id=m2.id, title="3. Async Queue Retry Policy & Backoff", start_time=76.0),
            Topic(meeting_id=m2.id, title="4. Dead-Letter Queue Monitoring", start_time=140.0)
        ]
        db.add_all(top2_list)

        act2_list = [
            ActionItem(meeting_id=m2.id, title="Submit PR for parallel CI test runner configuration", description="Split Playwright tests into 4 matrix workers", assignee="Priya Patel", due_date="Aug 13, 2026", completed=True),
            ActionItem(meeting_id=m2.id, title="Implement exponential backoff retry handler in Celery tasks", description="Include max 5 attempts and jitter offset", assignee="David Kim", due_date="Aug 17, 2026", completed=False),
            ActionItem(meeting_id=m2.id, title="Configure Datadog alerts for dead-letter queue volume spikes", description="Alert on Slack channel #eng-alerts if queue > 50 messages", assignee="Priya Patel", due_date="Aug 19, 2026", completed=False),
            ActionItem(meeting_id=m2.id, title="Update OpenAPI webhook payload schema definitions", description="Document event types for partner integrations", assignee="Alex Mercer", due_date="Aug 21, 2026", completed=False)
        ]
        db.add_all(act2_list)

        # -------------------------------------------------------------
        # Meeting 3: Marketing Planning & Brand Strategy
        # -------------------------------------------------------------
        m3 = Meeting(
            title="Marketing Planning & Campaign Strategy",
            date="Aug 08, 2026",
            time="11:00 AM",
            duration="35m",
            description="Planning for product launch campaign, developer content strategy, and SEO optimization."
        )
        db.add(m3)
        db.flush()

        p3_list = [
            Participant(meeting_id=m3.id, name="Laura Vance", email="laura.v@acme.io"),
            Participant(meeting_id=m3.id, name="Tom Bradley", email="tom.b@acme.io"),
            Participant(meeting_id=m3.id, name="Sarah Jenkins", email="sarah.j@acme.io")
        ]
        db.add_all(p3_list)

        t3_segments = [
            TranscriptSegment(meeting_id=m3.id, speaker="Laura Vance", start_time=0.0, end_time=15.0, text="Welcome everyone. Today we are aligning our campaign strategy for the upcoming v2 launch."),
            TranscriptSegment(meeting_id=m3.id, speaker="Tom Bradley", start_time=15.0, end_time=35.0, text="We have 3 major content pillars: technical customer case studies, product feature walkthroughs, and SEO blog guides."),
            TranscriptSegment(meeting_id=m3.id, speaker="Sarah Jenkins", start_time=35.0, end_time=55.0, text="From product side, we can provide video walk-throughs of our transcript intelligence features."),
            TranscriptSegment(meeting_id=m3.id, speaker="Laura Vance", start_time=55.0, end_time=75.0, text="Awesome. Tom, can you draft 5 blog post summaries targeting high-volume developer keywords?"),
            TranscriptSegment(meeting_id=m3.id, speaker="Tom Bradley", start_time=75.0, end_time=95.0, text="Yes! I'm researching terms around AI meeting summarization and automated action item tracking."),
            TranscriptSegment(meeting_id=m3.id, speaker="Sarah Jenkins", start_time=95.0, end_time=115.0, text="We should also coordinate with Customer Success to get quotes from our beta customers."),
            TranscriptSegment(meeting_id=m3.id, speaker="Laura Vance", start_time=115.0, end_time=135.0, text="Great point. Let's schedule customer interviews for early next week."),
            TranscriptSegment(meeting_id=m3.id, speaker="Tom Bradley", start_time=135.0, end_time=155.0, text="I will create the landing page copy for the email campaign subscriber blast."),
            TranscriptSegment(meeting_id=m3.id, speaker="Laura Vance", start_time=155.0, end_time=175.0, text="Target launch date is September 1st. Thanks everyone!")
        ]
        db.add_all(t3_segments)

        s3 = Summary(
            meeting_id=m3.id,
            overview="Marketing team aligned on the September 1st product launch campaign across developer content marketing, SEO keyword optimization, and customer case studies.",
            key_points=json.dumps([
                "Defined 3 core campaign pillars: Case studies, Product walkthrough videos, and SEO developer blogs.",
                "Targeted high-intent keywords for AI transcript notes and automated task extraction.",
                "Coordinating with Customer Success to record beta user testimonial quotes.",
                "Set final content creation deadline for August 25th ahead of the September 1st launch."
            ])
        )
        db.add(s3)

        top3_list = [
            Topic(meeting_id=m3.id, title="1. Launch Campaign Objectives", start_time=0.0),
            Topic(meeting_id=m3.id, title="2. Content Pillars & Video Demos", start_time=35.0),
            Topic(meeting_id=m3.id, title="3. SEO & Developer Keyword Research", start_time=75.0),
            Topic(meeting_id=m3.id, title="4. Beta Customer Case Studies", start_time=95.0)
        ]
        db.add_all(top3_list)

        act3_list = [
            ActionItem(meeting_id=m3.id, title="Draft 5 SEO blog post outlines for AI meeting workflow keywords", description="Target search intent for developer transcription tools", assignee="Tom Bradley", due_date="Aug 16, 2026", completed=False),
            ActionItem(meeting_id=m3.id, title="Record 60-second product demo video of transcript search", description="Show active line highlight and seeking features", assignee="Sarah Jenkins", due_date="Aug 18, 2026", completed=True),
            ActionItem(meeting_id=m3.id, title="Reach out to 4 beta enterprise accounts for testimonial approval", description="Get customer logo approval and short quote", assignee="Laura Vance", due_date="Aug 20, 2026", completed=False),
            ActionItem(meeting_id=m3.id, title="Finalize launch email campaign sequence and landing page text", description="Prepare Mailchimp campaign templates", assignee="Tom Bradley", due_date="Aug 22, 2026", completed=False)
        ]
        db.add_all(act3_list)

        # -------------------------------------------------------------
        # Meeting 4: Customer Feedback & User Onboarding Insights
        # -------------------------------------------------------------
        m4 = Meeting(
            title="Customer Feedback & User Onboarding Insights",
            date="Aug 05, 2026",
            time="04:00 PM",
            duration="40m",
            description="Synthesis of user research interviews, feature request voting trends, and dashboard UX improvements."
        )
        db.add(m4)
        db.flush()

        p4_list = [
            Participant(meeting_id=m4.id, name="Emily Chen", email="emily.chen@acme.io"),
            Participant(meeting_id=m4.id, name="Rachel Green", email="rachel.g@acme.io"),
            Participant(meeting_id=m4.id, name="John Carter", email="john.carter@acme.io")
        ]
        db.add_all(p4_list)

        t4_segments = [
            TranscriptSegment(meeting_id=m4.id, speaker="Rachel Green", start_time=0.0, end_time=15.0, text="Hi team. I summarized feedback from 12 customer user research sessions conducted last week."),
            TranscriptSegment(meeting_id=m4.id, speaker="Emily Chen", start_time=15.0, end_time=35.0, text="What was the primary positive feedback regarding our meeting detail workspace?"),
            TranscriptSegment(meeting_id=m4.id, speaker="Rachel Green", start_time=35.0, end_time=58.0, text="Users love the interactive audio seeking when clicking transcript lines! It saves them tons of time."),
            TranscriptSegment(meeting_id=m4.id, speaker="John Carter", start_time=58.0, end_time=78.0, text="That's great validation. What area had the highest request for improvements?"),
            TranscriptSegment(meeting_id=m4.id, speaker="Rachel Green", start_time=78.0, end_time=100.0, text="Action item management. Users want to be able to mark items completed directly in the summary view."),
            TranscriptSegment(meeting_id=m4.id, speaker="Emily Chen", start_time=100.0, end_time=120.0, text="We can easily add inline checkbox toggles and quick edit buttons for action items."),
            TranscriptSegment(meeting_id=m4.id, speaker="John Carter", start_time=120.0, end_time=142.0, text="Let's prioritize that for our immediate sprint release."),
            TranscriptSegment(meeting_id=m4.id, speaker="Rachel Green", start_time=142.0, end_time=165.0, text="Also, 4 power users requested exporting transcripts to Markdown and TXT formats."),
            TranscriptSegment(meeting_id=m4.id, speaker="Emily Chen", start_time=165.0, end_time=185.0, text="I will add a download dropdown to the meeting header bar.")
        ]
        db.add_all(t4_segments)

        s4 = Summary(
            meeting_id=m4.id,
            overview="User research synthesis confirmed high user delight with interactive timestamp-synced transcripts, while highlighting key user requests for inline action item editing and Markdown export capabilities.",
            key_points=json.dumps([
                "Validated interactive transcript timestamp-seeking as a top-performing feature.",
                "Identified key friction point: Users wanted fast inline action item status toggling.",
                "Planned immediate UX updates for inline task completion and editing controls.",
                "Agreed to introduce transcript and summary exports (TXT, Markdown)."
            ])
        )
        db.add(s4)

        top4_list = [
            Topic(meeting_id=m4.id, title="1. User Research Overview", start_time=0.0),
            Topic(meeting_id=m4.id, title="2. Interactive Transcript Feedback", start_time=35.0),
            Topic(meeting_id=m4.id, title="3. Action Item Workflow Enhancements", start_time=78.0),
            Topic(meeting_id=m4.id, title="4. Export & Download Capabilities", start_time=142.0)
        ]
        db.add_all(top4_list)

        act4_list = [
            ActionItem(meeting_id=m4.id, title="Implement inline action item check box toggling", description="Allow instant state update without reloading page", assignee="Emily Chen", due_date="Aug 14, 2026", completed=True),
            ActionItem(meeting_id=m4.id, title="Add Markdown & TXT export options to meeting view", description="Download formatted transcript and action items", assignee="Emily Chen", due_date="Aug 17, 2026", completed=False),
            ActionItem(meeting_id=m4.id, title="Share user research report with design and product team", description="Publish Notion document with video highlight snippets", assignee="Rachel Green", due_date="Aug 10, 2026", completed=True),
            ActionItem(meeting_id=m4.id, title="Review customer feedback backlog for Q4 prioritization", description="Categorize tags by UI, performance, and integrations", assignee="John Carter", due_date="Aug 19, 2026", completed=False)
        ]
        db.add_all(act4_list)

        # -------------------------------------------------------------
        # Meeting 5: Quarterly Financial & Operations Review
        # -------------------------------------------------------------
        m5 = Meeting(
            title="Quarterly Financial & Operations Review",
            date="Aug 01, 2026",
            time="09:00 AM",
            duration="55m",
            description="Review of Q2 revenue growth, gross margins, SaaS metrics, and Q3 hiring allocations."
        )
        db.add(m5)
        db.flush()

        p5_list = [
            Participant(meeting_id=m5.id, name="John Carter", email="john.carter@acme.io"),
            Participant(meeting_id=m5.id, name="Marcus Vance", email="marcus.v@acme.io"),
            Participant(meeting_id=m5.id, name="Laura Vance", email="laura.v@acme.io")
        ]
        db.add_all(p5_list)

        t5_segments = [
            TranscriptSegment(meeting_id=m5.id, speaker="Marcus Vance", start_time=0.0, end_time=18.0, text="Good morning. Let's start with our Q2 financial results. ARR grew by 28% quarter-over-quarter."),
            TranscriptSegment(meeting_id=m5.id, speaker="John Carter", start_time=18.0, end_time=40.0, text="That exceeds our original target of 22%. What drove the largest expansion revenue?"),
            TranscriptSegment(meeting_id=m5.id, speaker="Marcus Vance", start_time=40.0, end_time=62.0, text="Expansion was driven by mid-market team seat upgrades and higher meeting recording usage."),
            TranscriptSegment(meeting_id=m5.id, speaker="Laura Vance", start_time=62.0, end_time=84.0, text="Our net revenue retention reached 118%, which is very healthy for our market segment."),
            TranscriptSegment(meeting_id=m5.id, speaker="Marcus Vance", start_time=84.0, end_time=105.0, text="On the expense side, cloud infrastructure costs grew by 8%. We can optimize our audio storage retention."),
            TranscriptSegment(meeting_id=m5.id, speaker="John Carter", start_time=105.0, end_time=128.0, text="Let's implement S3 intelligent tiering to compress older meeting audio after 90 days."),
            TranscriptSegment(meeting_id=m5.id, speaker="Laura Vance", start_time=128.0, end_time=150.0, text="Regarding hiring, we have budget approved for 2 senior full-stack engineers and 1 UX designer."),
            TranscriptSegment(meeting_id=m5.id, speaker="John Carter", start_time=150.0, end_time=172.0, text="Fantastic. Marcus, please send the finalized Q2 board deck to investors by Friday.")
        ]
        db.add_all(t5_segments)

        s5 = Summary(
            meeting_id=m5.id,
            overview="Q2 financial review highlighted strong 28% QoQ ARR growth and 118% Net Revenue Retention, alongside infrastructure cost optimization strategies and Q3 engineering headcount approvals.",
            key_points=json.dumps([
                "Achieved 28% ARR growth in Q2, surpassing the 22% target forecast.",
                "Net Revenue Retention reached 118% driven by mid-market account expansion.",
                "Approved cloud audio storage lifecycle policy to reduce AWS S3 spending.",
                "Authorized Q3 hiring budget for 2 Senior Full-Stack Engineers and 1 UX Designer."
            ])
        )
        db.add(s5)

        top5_list = [
            Topic(meeting_id=m5.id, title="1. Q2 Financial Growth & ARR", start_time=0.0),
            Topic(meeting_id=m5.id, title="2. Account Expansion & Retention Metrics", start_time=40.0),
            Topic(meeting_id=m5.id, title="3. Cloud Storage Cost Optimization", start_time=84.0),
            Topic(meeting_id=m5.id, title="4. Headcount Allocations & Board Deck", start_time=128.0)
        ]
        db.add_all(top5_list)

        act5_list = [
            ActionItem(meeting_id=m5.id, title="Finalize investor Q2 board update slide deck", description="Include ARR breakdown and unit economics charts", assignee="Marcus Vance", due_date="Aug 08, 2026", completed=True),
            ActionItem(meeting_id=m5.id, title="Set up S3 audio file lifecycle compression rules", description="Transition audio older than 90 days to Glacier Instant Retrieval", assignee="John Carter", due_date="Aug 18, 2026", completed=False),
            ActionItem(meeting_id=m5.id, title="Post job descriptions for Senior Full-Stack Engineers", description="Publish on Greenhouse and LinkedIn Jobs", assignee="Laura Vance", due_date="Aug 12, 2026", completed=True),
            ActionItem(meeting_id=m5.id, title="Schedule quarterly budget review with department leads", description="Review Q3 department spend vs budget", assignee="Marcus Vance", due_date="Aug 25, 2026", completed=False)
        ]
        db.add_all(act5_list)

        db.commit()
        print("Database successfully seeded with 5 comprehensive meetings, transcripts, summaries, topics, and action items!")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
